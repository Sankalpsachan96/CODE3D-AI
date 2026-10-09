
const { spawn, spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const TIME_LIMIT = 3000;
const MAX_OUTPUT = 100 * 1024;

function commandAvailable(command, args = ["--version"]) {
  try {
    const result = spawnSync(command, args, {
      stdio: "ignore",
      windowsHide: true,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function getPythonCommand() {
  if (commandAvailable("python3")) return "python3";
  if (commandAvailable("python")) return "python";
  return null;
}

let sandboxAvailabilityCache;

function sandboxAvailable() {
  if (sandboxAvailabilityCache !== undefined) return sandboxAvailabilityCache;
  if (!commandAvailable("bwrap", ["--version"])) {
    sandboxAvailabilityCache = false;
    return false;
  }

  // Probe actual namespace setup, not just whether the binary exists.
  const args = ["--unshare-all", "--die-with-parent"];
  for (const directory of ["/usr", "/etc", "/lib", "/lib64"]) {
    if (fs.existsSync(directory)) args.push("--ro-bind", directory, directory);
  }
  args.push(
    "--proc", "/proc",
    "--dev", "/dev",
    "--tmpfs", "/tmp",
    "--",
    "/usr/bin/prlimit",
    "--cpu=2",
    "--as=536870912",
    "--nproc=32",
    "--fsize=1048576",
    "--nofile=64",
    "--",
    "/usr/bin/true"
  );
  try {
    const result = spawnSync("bwrap", args, {
      encoding: "utf8",
      windowsHide: true,
      timeout: 2500,
      env: { PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" },
    });
    sandboxAvailabilityCache = result.status === 0;
    if (!sandboxAvailabilityCache) {
      const reason = (result.error?.message || result.stderr || result.stdout || `bwrap probe exited with status ${result.status}`)
        .toString()
        .trim()
        .slice(0, 1000);
      console.error("[sandbox] Bubblewrap probe failed:", reason || "no diagnostic output");
    }
  } catch {
    sandboxAvailabilityCache = false;
  }
  return sandboxAvailabilityCache;
}

const JUDGE0_LANGUAGES = {
  c: 50,
  cpp: 54,
  java: 62,
  javascript: 63,
  python: 71,
};

function getJudge0Config(options = {}) {
  return {
    url: String(options.judge0Url ?? process.env.JUDGE0_URL ?? "").trim().replace(/\/+$/, ""),
    apiKey: options.judge0ApiKey ?? process.env.JUDGE0_API_KEY ?? "",
  };
}

function getRuntimeAvailability() {
  const judge0 = getJudge0Config();
  const localSandbox = sandboxAvailable();
  return {
    javascript: Boolean(process.execPath),
    cpp: commandAvailable("g++"),
    c: commandAvailable("gcc"),
    python: Boolean(getPythonCommand()),
    java: commandAvailable("javac") && commandAvailable("java"),
    sandbox: localSandbox || Boolean(judge0.url),
    executionProvider: localSandbox ? "local-bubblewrap" : (judge0.url ? "remote-judge0" : "unavailable"),
    nodeVersion: process.version,
  };
}

const RUNTIME_TRACE_MARKER = "__CODE3D_RUNTIME_TRACE__";
function buildPythonInstrumentedSource(source) {
  const encoded = Buffer.from(source, "utf8").toString("base64");
  return [
    "import sys, json, base64"
    ,"__code3d_source = base64.b64decode(\"" + encoded + "\").decode(\"utf-8\")"
    ,"__code3d_events = []"
    ,"__code3d_steps = 0"
    ,"__code3d_frames = []"
    ,"def __code3d_safe(value, depth=0, seen=None):"
    ," if seen is None: seen = set()"
    ," if depth > 4: return '<max-depth>'"
    ," if value is None or isinstance(value, (bool, int, float)): return value"
    ," if isinstance(value, str): return value if len(value) <= 200 else value[:200] + \"…\""
    ," is_container = isinstance(value, (list, tuple, dict)) or hasattr(value, \"__dict__\")"
    ," if not is_container: return '<' + type(value).__name__ + '>'"
    ," identity = id(value)"
    ," if identity in seen: return '<cycle>'"
    ," seen.add(identity)"
    ," try:"
    ,"  if isinstance(value, (list, tuple)): return [__code3d_safe(v, depth + 1, seen) for v in value[:40]]"
    ,"  if isinstance(value, dict): return {str(k)[:80]: __code3d_safe(v, depth + 1, seen) for k, v in list(value.items())[:40] if not str(k).startswith(\"__code3d_\")}"
    ,"  fields = vars(value)"
    ,"  result = {\"__type__\": type(value).__name__}"
    ,"  for k, v in list(fields.items())[:50]:"
    ,"   if not str(k).startswith(\"__\"): result[str(k)[:80]] = __code3d_safe(v, depth + 1, seen)"
    ,"  return result"
    ," except Exception:"
    ,"  return '<' + type(value).__name__ + '>'"
    ," finally:"
    ,"  seen.discard(identity)"
    ,"def __code3d_trace(frame, event, arg):"
    ," global __code3d_steps"
    ," if frame.f_code.co_filename == \"<user_code>\" and event == \"call\": __code3d_frames.append(frame.f_code.co_name)"
    ," if frame.f_code.co_filename == \"<user_code>\" and event == \"return\": "
    ,"  if __code3d_frames: __code3d_frames.pop()"
    ," if event == \"line\" and frame.f_code.co_filename == \"<user_code>\":"
    ,"  __code3d_steps += 1"
    ,"  if __code3d_steps <= 120: __code3d_events.append({\"step\": __code3d_steps, \"line\": frame.f_lineno, \"event\": \"runtime_line\", \"variables\": {k: __code3d_safe(v) for k, v in frame.f_locals.items() if not k.startswith(\"__code3d_\") and not k.startswith(\"__\")}, \"callStack\": list(__code3d_frames), \"message\": \"Runtime snapshot captured at this executed line.\"})"
    ,"  elif __code3d_steps == 121: __code3d_events.append({\"step\": 121, \"line\": frame.f_lineno, \"event\": \"trace_limit\", \"variables\": {k: __code3d_safe(v) for k, v in frame.f_locals.items() if not k.startswith(\"__code3d_\") and not k.startswith(\"__\")}, \"message\": \"Runtime trace capped at 120 line events; program output still reflects the complete run.\"})"
    ," return __code3d_trace"
    ,"try:"
    ," sys.settrace(__code3d_trace)"
    ," exec(compile(__code3d_source, \"<user_code>\", \"exec\"), {\"__name__\": \"__main__\"})"
    ,"except SystemExit:"
    ," pass"
    ,"finally:"
    ," sys.settrace(None)"
    ," print(\"" + RUNTIME_TRACE_MARKER + "\" + json.dumps(__code3d_events, separators=(\",\", \":\")), file=sys.stderr)"
  ].join("\n");
}
function extractPythonRuntimeTrace(stderr) {
  const text = String(stderr || "");
  const i = text.lastIndexOf(RUNTIME_TRACE_MARKER);
  if (i < 0) return { stderr: text, runtimeTrace: null };
  const before = text.slice(0, i).trimEnd();
  const payload = text.slice(i + RUNTIME_TRACE_MARKER.length).split(/\r?\n/, 1)[0];
  try { const events = JSON.parse(payload); return { stderr: before, runtimeTrace: Array.isArray(events) ? events : null }; }
  catch { return { stderr: text, runtimeTrace: null }; }
}
function extractRuntimeTrace(stderr) {
  const text = String(stderr || "");
  const i = text.lastIndexOf(RUNTIME_TRACE_MARKER);
  if (i < 0) return { stderr: text, runtimeTrace: null };
  const before = text.slice(0, i).trimEnd();
  const payload = text.slice(i + RUNTIME_TRACE_MARKER.length).split(/\r?\n/, 1)[0];
  try {
    const events = JSON.parse(payload);
    return { stderr: before, runtimeTrace: Array.isArray(events) ? events : null };
  } catch {
    return { stderr: text, runtimeTrace: null };
  }
}

function buildJavaScriptTraceRunnerSource(embeddedSource = null) {
  return String.raw`const inspector = require("node:inspector");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const marker = "__CODE3D_RUNTIME_TRACE__";
const userPath = process.argv[2] || "code3d-user.js";
const userSource = ${embeddedSource === null ? 'fs.readFileSync(userPath, "utf8")' : `Buffer.from("${Buffer.from(embeddedSource, "utf8").toString("base64")}", "base64").toString("utf8")`}.replace(/^#!/, "//");
const events = [];
const maxSteps = 120;
const session = new inspector.Session();
let userScriptId = null;
let pendingPauseHandlers = 0;
let userCodeFinished = false;
let finishPauseWait = null;
const ignoredNames = new Set(["require", "module", "exports", "__filename", "__dirname", "arguments"]);
const post = (method, params = {}) => new Promise((resolve, reject) => session.post(method, params, (error, result) => error ? reject(error) : resolve(result)));

async function serializeRemote(remote, depth = 0, seen = new Set()) {
  if (!remote || remote.type === "undefined") return "<undefined>";
  if (Object.prototype.hasOwnProperty.call(remote, "value")) return remote.value;
  if (remote.subtype === "null") return null;
  if (!remote.objectId) return remote.description || "<unavailable>";
  if (depth >= 4) return "<max-depth>";
  if (seen.has(remote.objectId)) return "<cycle>";
  const nextSeen = new Set(seen);
  nextSeen.add(remote.objectId);
  if (remote.type === "function") return "<function " + (remote.description || "anonymous") + ">";
  const response = await post("Runtime.getProperties", { objectId: remote.objectId, ownProperties: true, accessorPropertiesOnly: false });
  const descriptors = (response.result || []).filter((item) => item.value && item.name !== "__proto__").slice(0, 40);
  if (remote.subtype === "array") {
    const array = [];
    for (const descriptor of descriptors) {
      if (/^\d+$/.test(descriptor.name)) array[Number(descriptor.name)] = await serializeRemote(descriptor.value, depth + 1, nextSeen);
    }
    return array;
  }
  if (remote.subtype === "map" || remote.subtype === "set") return remote.description || "<" + remote.subtype + ">";
  const object = {};
  for (const descriptor of descriptors) object[descriptor.name.slice(0, 80)] = await serializeRemote(descriptor.value, depth + 1, nextSeen);
  return Object.keys(object).length ? object : (remote.description || "<object>");
}

session.connect();
session.on("Debugger.scriptParsed", ({ params }) => { if (params.url.endsWith("code3d-user.js")) userScriptId = params.scriptId; });
session.on("Debugger.paused", async ({ params }) => {
  pendingPauseHandlers += 1;
  try {
    const isUserFrame = (item) => item.location.scriptId === userScriptId;
    const frame = params.callFrames.find(isUserFrame);
    if (frame && events.length < maxSteps) {
      const variables = {};
      for (const scope of frame.scopeChain.filter((item) => ["local", "block", "script"].includes(item.type))) {
        if (!scope?.object?.objectId) continue;
        const result = await post("Runtime.getProperties", { objectId: scope.object.objectId, ownProperties: true, accessorPropertiesOnly: false });
        for (const property of (result.result || []).filter((item) => item.value && !ignoredNames.has(item.name)).slice(0, 100)) {
          if (!(property.name in variables)) variables[property.name] = await serializeRemote(property.value);
        }
      }
      events.push({ step: events.length + 1, line: Math.max(1, frame.location.lineNumber), event: "runtime_line", variables, callStack: params.callFrames.filter(isUserFrame).map((item) => item.functionName || "<main>"), message: "Runtime snapshot captured at this executed line." });
    } else if (events.length === maxSteps) {
      const last = events.at(-1) || {};
      events.push({ step: maxSteps + 1, line: last.line, variables: last.variables || {}, event: "trace_limit", message: "Runtime trace capped at 120 line events; program output still reflects the complete run." });
      await post("Debugger.disable");
    }
  } catch (error) {
    process.stderr.write("Runtime tracing warning: " + error.message + "\n");
  } finally {
    session.post("Debugger.resume", {}, () => {
      pendingPauseHandlers -= 1;
      if (userCodeFinished && pendingPauseHandlers === 0) finishPauseWait?.();
    });
  }
});

(async () => {
  try {
    await post("Debugger.enable");
    const lineCount = userSource.split(/\r?\n/).length;
    for (let lineNumber = 1; lineNumber <= lineCount; lineNumber += 1) {
      await post("Debugger.setBreakpointByUrl", { url: "code3d-user.js", lineNumber });
    }
    const wrapped = "(function(require,module,exports,__filename,__dirname){\n" + userSource + "\n})";
    const script = new vm.Script(wrapped, { filename: "code3d-user.js" });
    const runUserCode = script.runInThisContext();
    const userModule = { exports: {} };
    try {
      runUserCode(require, userModule, userModule.exports, userPath, path.dirname(userPath));
    } finally {
      userCodeFinished = true;
      if (pendingPauseHandlers > 0) await new Promise((resolve) => { finishPauseWait = resolve; });
    }
  } catch (error) {
    process.stderr.write((error.stack || error.message) + "\n");
    process.exitCode = 1;
  } finally {
    try { await post("Debugger.disable"); } catch {}
    session.disconnect();
    process.stderr.write(marker + JSON.stringify(events) + "\n");
  }
})();
`;
}
function buildGdbTraceScript(sourceFile, stdinFile, stdoutFile, stderrFile, tempDirectory, sandboxRoot = "/work") {
  const root = String(sandboxRoot).replace(/\\/g, "/").replace(/\/$/, "");
  const sandboxPath = (value) => `${root}/${path.relative(tempDirectory, value).split(path.sep).join("/")}`;
  const py = (value) => JSON.stringify(sandboxPath(value));
  return [
    "set pagination off", "set confirm off", "set print elements 100", "set print repeats 20",
    "python",
    "import gdb, json",
    `source_path = ${py(sourceFile)}`,
    "events = []",
    "last_signature = None",
    "def safe_value(value, depth=0, seen=None):",
    "    if seen is None: seen = set()",
    "    if depth > 3: return '<max-depth>'",
    "    try:",
    "        t = value.type.strip_typedefs()",
    "        code = t.code",
    "        if str(t).startswith('std::vector<'):",
    "            impl = value['_M_impl']",
    "            start = impl['_M_start']",
    "            finish = impl['_M_finish']",
    "            element_type = t.template_argument(0)",
    "            length = min(max(0, (int(finish) - int(start)) // max(1, int(element_type.sizeof))), 40)",
    "            return [safe_value((start + index).dereference(), depth + 1, seen) for index in range(length)]",
    "        if code == gdb.TYPE_CODE_PTR:",
    "            address = int(value)",
    "            if address == 0: return None",
    "            if address in seen: return '<cycle>'",
    "            target = t.target().strip_typedefs()",
    "            if target.code in (gdb.TYPE_CODE_STRUCT, gdb.TYPE_CODE_UNION):",
    "                return safe_value(value.dereference(), depth + 1, seen | {address})",
    "            return hex(address)",
    "        if code == gdb.TYPE_CODE_ARRAY:",
    "            return [safe_value(value[i], depth + 1, seen) for i in range(min(int(value.type.range()[1] - value.type.range()[0] + 1), 40))]",
    "        if code in (gdb.TYPE_CODE_STRUCT, gdb.TYPE_CODE_UNION):",
    "            result = {}",
    "            for field in t.fields()[:25]:",
    "                if field.name:",
    "                    try: result[field.name] = safe_value(value[field.name], depth + 1, seen)",
    "                    except Exception: pass",
    "            return result",
    "        if code == gdb.TYPE_CODE_BOOL: return bool(value)",
    "        if code in (gdb.TYPE_CODE_INT, gdb.TYPE_CODE_ENUM): return int(value)",
    "        if code == gdb.TYPE_CODE_FLT: return float(value)",
    "        return value.format_string()[:200]",
    "    except Exception: return '<unavailable>'",
    "class Code3dLineBreakpoint(gdb.Breakpoint):",
    "    def stop(self):",
    "        global last_signature",
    "        try:",
    "            frame = gdb.selected_frame()",
    "            sal = frame.find_sal()",
    "            if sal.line <= 0: return False",
    "            if len(events) >= 120:",
    "                if len(events) == 120:",
    "                    limit = dict(events[-1]); limit.update({'step': 121, 'event': 'trace_limit', 'message': 'Runtime trace capped at 120 line events; program output still reflects the complete run.'}); events.append(limit)",
    "                self.enabled = False",
    "                return False",
    "            variables = {}",
    "            block = frame.block()",
    "            while block:",
    "                for symbol in block:",
    "                    if symbol.is_variable or symbol.is_argument:",
    "                        name = symbol.name",
    "                        if name and name not in variables and name not in ('argc', 'argv'):",
    "                            try: variables[name] = safe_value(frame.read_var(symbol))",
    "                            except Exception: pass",
    "                if block.function: break",
    "                block = block.superblock",
    "            signature = (sal.line, json.dumps(variables, sort_keys=True), int(frame.pc()))",
    "            if signature == last_signature: return False",
    "            last_signature = signature",
    "            stack = []",
    "            current = frame",
    "            while current and len(stack) < 20:",
    "                try: stack.append(current.name() or '<main>'); current = current.older()",
    "                except Exception: break",
    "            events.append({'step': len(events)+1, 'line': sal.line, 'event': 'runtime_line', 'variables': variables, 'callStack': stack, 'message': 'Runtime snapshot captured at this executed line.'})",
    "        except Exception: pass",
    "        return False",
    "for number in range(1, sum(1 for _ in open(source_path, encoding='utf-8')) + 1):",
    "    try: Code3dLineBreakpoint(source_path + ':' + str(number), internal=True)",
    "    except gdb.error: pass",
    `run_command = 'run < ${sandboxPath(stdinFile)} > ${sandboxPath(stdoutFile)} 2> ${sandboxPath(stderrFile)}'`,
    "try: gdb.execute(run_command, to_string=True)",
    "except gdb.error as error: gdb.write('__CODE3D_DEBUGGER_ERROR__' + str(error).replace('\\n', ' ') + '\\n', gdb.STDERR)",
    "gdb.write('__CODE3D_RUNTIME_TRACE__' + json.dumps(events, separators=(',', ':')) + '\\n', gdb.STDERR)",
    "end",
  ].join("\n");
}

function buildJavaTraceRunnerSource() {
  return String.raw`import com.sun.jdi.*;
import com.sun.jdi.connect.Connector;
import com.sun.jdi.connect.LaunchingConnector;
import com.sun.jdi.event.*;
import com.sun.jdi.request.*;
import java.io.*;
import java.util.*;

public final class Code3dJavaTraceRunner {
  static final String MARKER = "__CODE3D_RUNTIME_TRACE__";
  static final List<Map<String,Object>> EVENTS = new ArrayList<>();
  static final Set<Long> SEEN = new HashSet<>();
  static Value field(ObjectReference object, String name) {
    for (Field f : object.referenceType().allFields()) if (f.name().equals(name) && !f.isStatic()) return object.getValue(f);
    return null;
  }
  static Object collection(ObjectReference object, int depth) {
    String type=object.referenceType().name();
    try {
      if (type.equals("java.util.ArrayList") || type.equals("java.util.Vector") || type.equals("java.util.Stack")) {
        Value data=field(object,"elementData"), size=field(object,"size"), count=field(object,"elementCount");
        if (data instanceof ArrayReference) {
          int length=size instanceof IntegerValue ? ((IntegerValue)size).value() : count instanceof IntegerValue ? ((IntegerValue)count).value() : ((ArrayReference)data).length();
          List<Object> out=new ArrayList<>(); for (Value item : ((ArrayReference)data).getValues(0,Math.min(Math.min(length,((ArrayReference)data).length()),40))) out.add(value(item,depth+1)); return out;
        }
      }
      if (type.equals("java.util.ArrayDeque")) {
        Value data=field(object,"elements"), h=field(object,"head"), t=field(object,"tail");
        if (data instanceof ArrayReference && h instanceof IntegerValue && t instanceof IntegerValue) {
          ArrayReference array=(ArrayReference)data; int i=((IntegerValue)h).value(), tail=((IntegerValue)t).value(); List<Object> out=new ArrayList<>();
          while (i!=tail && out.size()<40 && array.length()>0) { out.add(value(array.getValue(i),depth+1)); i=(i+1)%array.length(); } return out;
        }
      }
      if (type.equals("java.util.PriorityQueue")) {
        Value data=field(object,"queue"), size=field(object,"size");
        if (data instanceof ArrayReference) {
          int length=size instanceof IntegerValue ? ((IntegerValue)size).value() : ((ArrayReference)data).length();
          List<Object> out=new ArrayList<>(); for (Value item : ((ArrayReference)data).getValues(0,Math.min(Math.min(length,((ArrayReference)data).length()),40))) out.add(value(item,depth+1)); return out;
        }
      }
      if (type.equals("java.util.LinkedList")) {
        Value first=field(object,"first"); List<Object> out=new ArrayList<>(); Set<Long> seen=new HashSet<>();
        while (first instanceof ObjectReference && out.size()<40) {
          ObjectReference node=(ObjectReference)first; if (!seen.add(node.uniqueID())) break;
          out.add(value(field(node,"item"),depth+1)); first=field(node,"next");
        } return out;
      }
      if (type.equals("java.util.HashMap") || type.equals("java.util.LinkedHashMap")) {
        Value table=field(object,"table"); Map<String,Object> out=new LinkedHashMap<>(); Set<Long> seen=new HashSet<>();
        if (table instanceof ArrayReference) for (Value item : ((ArrayReference)table).getValues(0,Math.min(((ArrayReference)table).length(),40))) {
          Value node=item;
          while (node instanceof ObjectReference && out.size()<40) {
            ObjectReference entry=(ObjectReference)node; if (!seen.add(entry.uniqueID())) break;
            out.put(String.valueOf(value(field(entry,"key"),depth+1)),value(field(entry,"value"),depth+1)); node=field(entry,"next");
          }
        }
        return out;
      }
    } catch (Exception ignored) { }
    return null;
  }
  static Object value(Value v, int depth) {
    if (v == null) return null;
    if (v instanceof BooleanValue) return ((BooleanValue)v).value();
    if (v instanceof ByteValue) return ((ByteValue)v).value();
    if (v instanceof ShortValue) return ((ShortValue)v).value();
    if (v instanceof IntegerValue) return ((IntegerValue)v).value();
    if (v instanceof LongValue) return ((LongValue)v).value();
    if (v instanceof FloatValue) return ((FloatValue)v).value();
    if (v instanceof DoubleValue) return ((DoubleValue)v).value();
    if (v instanceof CharValue) return String.valueOf(((CharValue)v).value());
    if (v instanceof StringReference) return ((StringReference)v).value();
    if (depth >= 4) return "<max-depth>";
    if (v instanceof ArrayReference) {
      ArrayReference a = (ArrayReference)v;
      List<Object> out = new ArrayList<>();
      for (Value item : a.getValues(0, Math.min(a.length(), 40))) out.add(value(item, depth + 1));
      return out;
    }
    if (v instanceof ObjectReference) {
      ObjectReference o = (ObjectReference)v;
      String objectType=o.referenceType().name();
      if (objectType.equals("java.lang.Integer") || objectType.equals("java.lang.Long") || objectType.equals("java.lang.Short") || objectType.equals("java.lang.Byte") || objectType.equals("java.lang.Boolean") || objectType.equals("java.lang.Double") || objectType.equals("java.lang.Float") || objectType.equals("java.lang.Character")) return value(field(o,"value"),depth+1);
      Object collection=collection(o,depth); if (collection!=null) return collection;
      long id = o.uniqueID();
      if (!SEEN.add(id)) return "<cycle>";
      try {
        Map<String,Object> out = new LinkedHashMap<>();
        out.put("__type__", o.referenceType().name());
        int count = 0;
        for (Field f : o.referenceType().allFields()) {
          if (f.isStatic() || f.isSynthetic() || ++count > 25) continue;
          try { out.put(f.name(), value(o.getValue(f), depth + 1)); } catch (Exception ignored) { }
        }
        return out;
      } finally { SEEN.remove(id); }
    }
    return v.toString();
  }
  static String json(Object v) {
    if (v == null) return "null";
    if (v instanceof Boolean || v instanceof Number) return v.toString();
    if (v instanceof Map) {
      StringBuilder b = new StringBuilder("{"); boolean first = true;
      for (Object entryObject : ((Map<?,?>)v).entrySet()) {
        Map.Entry<?,?> e = (Map.Entry<?,?>)entryObject;
        if (!first) b.append(','); first = false;
        b.append(json(String.valueOf(e.getKey()))).append(':').append(json(e.getValue()));
      }
      return b.append('}').toString();
    }
    if (v instanceof Iterable) {
      StringBuilder b = new StringBuilder("["); boolean first = true;
      for (Object item : (Iterable<?>)v) { if (!first) b.append(','); first = false; b.append(json(item)); }
      return b.append(']').toString();
    }
    String s = String.valueOf(v); StringBuilder b = new StringBuilder("\"");
    for (int i=0;i<s.length();i++) { char c=s.charAt(i); if (c=='\\' || c=='\"') b.append('\\').append(c); else if (c=='\n') b.append("\\n"); else if (c=='\r') b.append("\\r"); else if (c=='\t') b.append("\\t"); else if (c<32) b.append(String.format("\\u%04x",(int)c)); else b.append(c); }
    return b.append('\"').toString();
  }
  static void pump(InputStream in, OutputStream out) {
    try (InputStream source=in) { byte[] buf=new byte[4096]; int n; while ((n=source.read(buf))!=-1) { out.write(buf,0,n); out.flush(); } } catch (IOException ignored) { }
  }
  public static void main(String[] args) throws Exception {
    String classPath=args[0], mainClass=args[1], sourceName=args[2];
    LaunchingConnector connector=Bootstrap.virtualMachineManager().defaultConnector();
    Map<String,Connector.Argument> a=connector.defaultArguments();
    a.get("main").setValue(mainClass);
    a.get("options").setValue("-cp \""+classPath+"\"");
    VirtualMachine vm;
    try { vm=connector.launch(a); }
    catch (Exception tracingFailure) {
      System.err.println("Runtime tracing unavailable in this sandbox; running the program without runtime snapshots: "+tracingFailure.getMessage());
      String java=System.getProperty("java.home")+File.separator+"bin"+File.separator+"java";
      Process plain=new ProcessBuilder(java,"-cp",classPath,mainClass).start();
      Thread plainOut=new Thread(() -> pump(plain.getInputStream(),System.out)); plainOut.start();
      Thread plainErr=new Thread(() -> pump(plain.getErrorStream(),System.err)); plainErr.start();
      Thread plainIn=new Thread(() -> { try { pump(System.in,plain.getOutputStream()); } finally { try { plain.getOutputStream().close(); } catch(IOException ignored){} } }); plainIn.start();
      int code=plain.waitFor(); plainOut.join(1000); plainErr.join(1000); System.exit(code); return;
    }
    Process child=vm.process();
    Thread out=new Thread(() -> pump(child.getInputStream(),System.out)); out.setDaemon(true); out.start();
    Thread err=new Thread(() -> pump(child.getErrorStream(),System.err)); err.setDaemon(true); err.start();
    Thread in=new Thread(() -> { try { pump(System.in,child.getOutputStream()); } finally { try { child.getOutputStream().close(); } catch(IOException ignored){} } }); in.setDaemon(true); in.start();
    EventRequestManager manager=vm.eventRequestManager();
    boolean done=false;
    vm.resume();
    while (!done) {
      EventSet set=vm.eventQueue().remove();
      try {
        for (Event event : set) {
          if (event instanceof VMStartEvent) {
            StepRequest request=manager.createStepRequest(((VMStartEvent)event).thread(),StepRequest.STEP_LINE,StepRequest.STEP_INTO);
            request.setSuspendPolicy(EventRequest.SUSPEND_EVENT_THREAD); request.enable();
          } else if (event instanceof StepEvent) {
            StepEvent step=(StepEvent)event;
            Location loc=step.location();
            String file;
            try { file=loc.sourceName(); } catch (AbsentInformationException missing) { continue; }
            if (!sourceName.equals(file)) continue;
            if (EVENTS.size()>=120) { if (EVENTS.size()==120) { Map<String,Object> limit=new LinkedHashMap<>(EVENTS.get(EVENTS.size()-1)); limit.put("step",121); limit.put("event","trace_limit"); limit.put("message","Runtime trace capped at 120 line events; program output still reflects the complete run."); EVENTS.add(limit); } manager.deleteEventRequests(manager.stepRequests()); continue; }
            StackFrame frame=step.thread().frame(0);
            Map<String,Object> vars=new LinkedHashMap<>();
            try { for (LocalVariable local : frame.visibleVariables()) vars.putIfAbsent(local.name(),value(frame.getValue(local),0)); } catch (AbsentInformationException ignored) { }
            Map<String,Object> e=new LinkedHashMap<>(); e.put("step",EVENTS.size()+1); e.put("line",loc.lineNumber()); e.put("event","runtime_line"); e.put("variables",vars);
            List<String> calls=new ArrayList<>(); for (StackFrame f : step.thread().frames()) { if (calls.size()>=20) break; calls.add(f.location().method().name()); }
            e.put("callStack",calls); e.put("message","Runtime snapshot captured at this executed line."); EVENTS.add(e);
          } else if (event instanceof VMDeathEvent || event instanceof VMDisconnectEvent) done=true;
        }
      } finally { try { set.resume(); } catch (VMDisconnectedException ignored) { done=true; } }
    }
    int exit=child.waitFor(); out.join(1000); err.join(1000);
    System.err.println(MARKER+json(EVENTS));
    System.exit(exit);
  }
}`;
}

function buildLoopbackJavaLauncherSource() {
  return [
    "import fcntl, os, socket, struct, sys",
    "sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)",
    "request = struct.pack('16sH14s', b'lo', 0, b'')",
    "flags = struct.unpack('16sH14s', fcntl.ioctl(sock.fileno(), 0x8913, request))[1]",
    "if not flags & 1:",
    "    request = struct.pack('16sH14s', b'lo', flags | 1, b'')",
    "    fcntl.ioctl(sock.fileno(), 0x8914, request)",
    "os.execvp(sys.argv[1], sys.argv[1:])",
  ].join("\n");
}

async function runWithGdb(binaryFile, sourceFile, tempDirectory, input, signal) {
  if (!commandAvailable("gdb", ["--version"])) return null;
  const stdinFile = path.join(tempDirectory, "program.stdin");
  const stdoutFile = path.join(tempDirectory, "program.stdout");
  const stderrFile = path.join(tempDirectory, "program.stderr");
  const scriptFile = path.join(tempDirectory, "trace.gdb");
  fs.writeFileSync(stdinFile, input || "", "utf8");
  fs.writeFileSync(scriptFile, buildGdbTraceScript(sourceFile, stdinFile, stdoutFile, stderrFile, tempDirectory, "/work"), "utf8");
  const startedAt = Date.now();
  const debugRun = await runProcess("gdb", ["--quiet", "--batch", "-x", scriptFile, "--args", binaryFile], {
    cwd: tempDirectory, timeoutMs: Math.max(TIME_LIMIT * 4, 12000), signal,
  });
  let traced = extractRuntimeTrace(debugRun.stderr);
  const output = fs.existsSync(stdoutFile) ? fs.readFileSync(stdoutFile, "utf8") : "";
  const programError = fs.existsSync(stderrFile) ? fs.readFileSync(stderrFile, "utf8") : "";
  const debuggerError = debugRun.stderr.match(/__CODE3D_DEBUGGER_ERROR__(.*)/)?.[1]?.trim();
  const signalError = debugRun.stdout.match(/Program received signal ([^\r\n]+)/)?.[1];
  const timeout = debugRun.timedOut;
  return {
    success: debugRun.success && !timeout && !signalError && !debuggerError,
    output: output.slice(0, MAX_OUTPUT),
    error: timeout ? "Time Limit Exceeded. The program may contain an infinite loop or excessive computation." : (programError || (signalError ? `Program terminated: ${signalError}` : debuggerError || "")),
    runtimeTrace: traced.runtimeTrace || [],
    executionTime: Date.now() - startedAt,
    timedOut: timeout,
    outputLimitExceeded: Buffer.byteLength(output, "utf8") > MAX_OUTPUT,
  };
}

async function executeWithJudge0(language, code, input = "", options = {}) {
  const { signal, fetchImpl = fetch } = options;
  const { url: judge0Url, apiKey } = getJudge0Config(options);
  if (!judge0Url) {
    return {
      success: false, stage: "sandbox", output: "",
      error: "Secure execution sandbox is unavailable and no remote sandbox provider is configured. Code was not executed.",
      executionTime: null,
    };
  }

  const normalizedLanguage = String(language).toLowerCase().trim();
  const languageKey = ["c++", "cpp"].includes(normalizedLanguage) ? "cpp"
    : ["py", "python"].includes(normalizedLanguage) ? "python"
    : ["js", "node", "javascript"].includes(normalizedLanguage) ? "javascript"
    : normalizedLanguage;
  const languageId = JUDGE0_LANGUAGES[languageKey];
  if (!languageId) {
    return { success: false, stage: "validation", output: "", error: `Language "${language}" is not supported.`, executionTime: null };
  }

  const startedAt = Date.now();
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (apiKey) headers["X-Auth-Token"] = apiKey;
  const requestTimeout = Number.isFinite(options.requestTimeoutMs) ? options.requestTimeoutMs : 12000;
  const pollInterval = Number.isFinite(options.pollIntervalMs) ? options.pollIntervalMs : 500;
  const deadlineMs = Number.isFinite(options.deadlineMs) ? options.deadlineMs : 20000;
  let token;

  const failure = (stage, error, executionTime) => ({
    success: false, stage, output: "", error, executionTime,
  });
  const responseDetails = async (response) => {
    try { return (await response.text()).slice(0, 500); } catch { return ""; }
  };
  const cancelRemoteSubmission = async () => {
    if (!token) return;
    try {
      await fetchImpl(`${judge0Url}/submissions/${encodeURIComponent(token)}?fields=status`, {
        method: "DELETE",
        headers,
        signal: AbortSignal.timeout(2000),
      });
    } catch (error) {
      console.warn("[sandbox] Judge0 cancellation request failed:", error.message);
    }
  };
  const waitForPoll = (duration) => new Promise((resolve, reject) => {
    const finish = () => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    };
    const timer = setTimeout(finish, duration);
    const cancel = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      reject(Object.assign(new Error("Execution cancelled"), { name: "AbortError" }));
    };
    if (signal?.aborted) cancel();
    else signal?.addEventListener("abort", cancel, { once: true });
  });

  try {
    if (signal?.aborted) return failure("cancelled", "Execution was cancelled before submission.", 0);
    const createResponse = await fetchImpl(`${judge0Url}/submissions?base64_encoded=false&wait=false`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        language_id: languageId,
        source_code: languageKey === "python" ? buildPythonInstrumentedSource(code)
          : languageKey === "javascript" ? buildJavaScriptTraceRunnerSource(code)
          : code,
        stdin: input,
        cpu_time_limit: 3,
        cpu_extra_time: 1,
        wall_time_limit: 6,
        memory_limit: 128000,
        stack_limit: 64000,
        max_processes_and_or_threads: 30,
        enable_network: false,
      }),
      signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(requestTimeout)]),
    });
    if (!createResponse.ok) {
      const details = await responseDetails(createResponse);
      if (createResponse.status === 429) throw Object.assign(new Error("Judge0 is rate limiting submissions. Wait briefly, then retry."), { stage: "rate_limit" });
      if (createResponse.status === 401 || createResponse.status === 403) throw Object.assign(new Error("Judge0 rejected the configured credentials or access policy."), { stage: "provider" });
      if (createResponse.status === 503 || createResponse.status === 502 || createResponse.status === 504) throw Object.assign(new Error("Judge0 is temporarily unavailable or its queue is full. Retry shortly."), { stage: "provider" });
      throw Object.assign(new Error(`Judge0 rejected the submission (HTTP ${createResponse.status})${details ? `: ${details}` : "."}`), { stage: "provider" });
    }
    const submission = await createResponse.json();
    if (typeof submission.token !== "string" || !submission.token) throw Object.assign(new Error("Judge0 returned an invalid submission response."), { stage: "provider" });
    token = submission.token;

    const deadline = Date.now() + deadlineMs;
    let result;
    while (Date.now() < deadline) {
      if (signal?.aborted) {
        await cancelRemoteSubmission();
        return failure("cancelled", "Execution was cancelled. Judge0 cancellation was requested; the provider may continue the submission if deletion is unavailable.", Date.now() - startedAt);
      }
      await waitForPoll(pollInterval);
      const pollResponse = await fetchImpl(
        `${judge0Url}/submissions/${encodeURIComponent(token)}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory`,
        { headers, signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(requestTimeout)]) }
      );
      if (!pollResponse.ok) {
        const details = await responseDetails(pollResponse);
        if (pollResponse.status === 429) throw Object.assign(new Error("Judge0 is rate limiting status checks. Retry shortly."), { stage: "rate_limit" });
        throw Object.assign(new Error(`Judge0 status check failed (HTTP ${pollResponse.status})${details ? `: ${details}` : "."}`), { stage: "provider" });
      }
      result = await pollResponse.json();
      if (!result || typeof result !== "object" || !Number.isInteger(result.status?.id)) throw Object.assign(new Error("Judge0 returned an invalid execution status."), { stage: "provider" });
      if (result.status?.id > 2) break;
    }
    if (!result || result.status?.id <= 2) {
      await cancelRemoteSubmission();
      return failure("timeout", "Judge0 did not finish before the 20 second execution deadline. The provider may still be processing the submission.", Date.now() - startedAt);
    }

    const output = String(result.stdout || "");
    const rawError = String(result.compile_output || result.stderr || result.message || "");
    const traced = ["python", "javascript"].includes(languageKey) ? extractRuntimeTrace(result.stderr || "") : { stderr: String(result.stderr || ""), runtimeTrace: null };
    const error = String(result.compile_output || traced.stderr || result.message || "");
    const judge0Seconds = Number.parseFloat(result.time);
    const executionTime = Number.isFinite(judge0Seconds)
      ? Math.max(0, Math.round(judge0Seconds * 1000))
      : Date.now() - startedAt;
    const outputBytes = Buffer.from(output, "utf8");
    if (outputBytes.length > MAX_OUTPUT) {
      return { success: false, stage: "runtime", output: outputBytes.subarray(0, MAX_OUTPUT).toString("utf8"), error: "Output Limit Exceeded (100 KiB).", executionTime };
    }
    const statusId = result.status.id;
    if (statusId === 5) return { success: false, stage: "timeout", output, error: "Time Limit Exceeded. Judge0 stopped the program after its execution limit.", executionTime };
    if (statusId === 13) return failure("provider", "Judge0 reported an internal execution error. Retry later.", executionTime);
    const accepted = statusId === 3;
    const stage = statusId === 6 ? "compile" : ([7, 8, 9, 10, 11, 12, 14].includes(statusId) ? "runtime" : "provider");
    return {
      success: accepted,
      stage: accepted ? "complete" : stage,
      output,
      stderr: traced.stderr,
      runtimeTrace: traced.runtimeTrace,
      error: accepted ? "" : (error || `Judge0 execution failed: ${result.status?.description || "unknown status"}`),
      executionTime,
    };
  } catch (error) {
    console.error("[sandbox] Remote Judge0 execution failed:", error.message);
    if (signal?.aborted || error?.name === "AbortError") {
      await cancelRemoteSubmission();
      return failure("cancelled", "Execution was cancelled. Judge0 cancellation was requested; the provider may continue the submission if deletion is unavailable.", Date.now() - startedAt);
    }
    return {
      success: false, stage: error.stage || "sandbox", output: "",
      error: error.stage ? error.message : `Could not reach the configured Judge0 service (${error.name === "TimeoutError" ? "request timed out" : "network or provider error"}). Code was not executed locally.`,
      executionTime: Date.now() - startedAt,
    };
  }
}

function createTempDirectory() {
  const id = crypto.randomBytes(8).toString("hex");
  const directory = path.join(os.tmpdir(), `code3d-${id}`);

  fs.mkdirSync(directory, { recursive: true });

  return directory;
}

function sandboxArguments(command, args, cwd, timeoutMs) {
  const bwrapArgs = ["--unshare-all", "--die-with-parent", "--new-session"];
  for (const directory of ["/usr", "/etc", "/lib", "/lib64"]) {
    if (fs.existsSync(directory)) bwrapArgs.push("--ro-bind", directory, directory);
  }
  bwrapArgs.push(
    "--proc", "/proc",
    "--dev", "/dev",
    "--tmpfs", "/tmp",
    "--bind", cwd, "/work",
    "--chdir", "/work",
    "--setenv", "PATH", "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    "--setenv", "HOME", "/work",
    "--setenv", "TMPDIR", "/tmp",
    "--setenv", "LANG", "C.UTF-8",
    "--",
    "/usr/bin/prlimit",
    `--cpu=${Math.max(1, Math.ceil(timeoutMs / 1000))}`,
    "--as=536870912",
    "--nproc=32",
    "--fsize=1048576",
    "--nofile=64",
    "--",
    command,
    ...args.map((arg) => {
      if (typeof arg !== "string") return String(arg);
      if (arg === cwd) return "/work";
      if (arg.startsWith(cwd + path.sep)) return "/work" + arg.slice(cwd.length);
      return arg;
    })
  );
  return bwrapArgs;
}

function killProcessTree(child) {
  if (!child?.pid) return;
  try {
    if (process.platform !== "win32") process.kill(-child.pid, "SIGKILL");
    else child.kill();
  } catch {
    try { child.kill("SIGKILL"); } catch {}
  }
}

function runProcess(command, args, options = {}) {
  return new Promise((resolve) => {
    if (!options.cwd || !sandboxAvailable()) {
      resolve({
        success: false,
        stdout: "",
        stderr: "Secure execution sandbox is unavailable. The backend must permit bubblewrap user, PID, and network namespaces; unisolated execution is disabled.",
        timedOut: false,
        outputLimitExceeded: false,
        exitCode: null,
      });
      return;
    }

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let cancelled = false;
    let outputLimitExceeded = false;
    const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : TIME_LIMIT;

    const child = spawn("bwrap", sandboxArguments(command, args, options.cwd, timeoutMs), {
      cwd: options.cwd,
      shell: false,
      detached: process.platform !== "win32",
      windowsHide: true,
      env: {
        PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        HOME: options.cwd,
        TMPDIR: "/tmp",
        LANG: "C.UTF-8",
      },
    });

    const timer = setTimeout(() => {
      timedOut = true;
      killProcessTree(child);
    }, timeoutMs);

    const cancel = () => {
      cancelled = true;
      killProcessTree(child);
    };
    if (options.signal?.aborted) cancel();
    else options.signal?.addEventListener("abort", cancel, { once: true });

    const appendBounded = (current, data) => {
      const totalBytes = Buffer.byteLength(stdout, "utf8") + Buffer.byteLength(stderr, "utf8");
      const remaining = Math.max(0, MAX_OUTPUT - totalBytes);
      const chunk = data.toString("utf8");
      const bounded = Buffer.from(chunk, "utf8").subarray(0, remaining).toString("utf8");
      return { value: current + bounded, exceeded: Buffer.byteLength(chunk, "utf8") > remaining };
    };

    child.stdout.on("data", (data) => {
      const result = appendBounded(stdout, data);
      stdout = result.value;
      if (result.exceeded) {
        outputLimitExceeded = true;
        killProcessTree(child);
      }
    });

    child.stderr.on("data", (data) => {
      const result = appendBounded(stderr, data);
      stderr = result.value;
      if (result.exceeded) {
        outputLimitExceeded = true;
        killProcessTree(child);
      }
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", cancel);
      resolve({
        success: false,
        stdout,
        stderr: error.message,
        timedOut,
        cancelled,
        outputLimitExceeded,
        exitCode: null,
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", cancel);
      resolve({
        success: code === 0 && !timedOut && !outputLimitExceeded,
        stdout,
        stderr,
        timedOut,
        cancelled,
        outputLimitExceeded,
        exitCode: code,
      });
    });

    if (options.input) child.stdin.write(options.input);
    child.stdin.end();
  });
}

/* =========================
   C++ EXECUTION
========================= */

async function executeCpp(code, input = "", signal) {
  if (!commandAvailable("g++")) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "C++ compiler (g++) is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so g++ is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.cpp");
  const executableFile = path.join(tempDirectory, "main.exe");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const compileResult = await runProcess(
      "g++",
      [
        "-std=c++20",
        "-g",
        "-O0",
        "-fno-omit-frame-pointer",
        sourceFile,
        "-o",
        executableFile,
      ],
      {
        cwd: tempDirectory,
        timeoutMs: 15000,
        signal,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error: compileResult.timedOut
          ? "C++ compilation timed out. The backend is under heavy load; please try again."
          : compileResult.stderr || "C++ compilation failed.",
        executionTime: null,
      };
    }

    const executionResult = await runWithGdb(executableFile, sourceFile, tempDirectory, input, signal);
    if (!executionResult) return { success: false, stage: "environment", output: "", error: "GDB runtime tracer is unavailable; execution is disabled because exact Program State capture is required.", executionTime: null };
    const executionTime = executionResult.executionTime;

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.output,
        runtimeTrace: executionResult.runtimeTrace,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.output.slice(0, MAX_OUTPUT),
        runtimeTrace: executionResult.runtimeTrace,
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.output,
        runtimeTrace: executionResult.runtimeTrace,
        error:
          executionResult.error ||
          "Program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.output,
      error: executionResult.error || "",
      executionTime,
      runtimeTrace: executionResult.runtimeTrace,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   C EXECUTION
========================= */

async function executeC(code, input = "", signal) {
  if (!commandAvailable("gcc")) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "C compiler (gcc) is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so gcc is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.c");
  const executableFile = path.join(tempDirectory, "main.exe");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");

    const compileResult = await runProcess(
      "gcc",
      [
        "-std=c17",
        "-g",
        "-O0",
        "-fno-omit-frame-pointer",
        sourceFile,
        "-o",
        executableFile,
      ],
      {
        cwd: tempDirectory,
        timeoutMs: 15000,
        signal,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error: compileResult.timedOut
          ? "C compilation timed out. The backend is under heavy load; please try again."
          : compileResult.stderr || "C compilation failed.",
        executionTime: null,
      };
    }

    const executionResult = await runWithGdb(executableFile, sourceFile, tempDirectory, input, signal);
    if (!executionResult) return { success: false, stage: "environment", output: "", error: "GDB runtime tracer is unavailable; execution is disabled because exact Program State capture is required.", executionTime: null };
    const executionTime = executionResult.executionTime;

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.output,
        runtimeTrace: executionResult.runtimeTrace,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.output.slice(0, MAX_OUTPUT),
        runtimeTrace: executionResult.runtimeTrace,
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.output,
        runtimeTrace: executionResult.runtimeTrace,
        error:
          executionResult.error ||
          "Program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.output,
      error: executionResult.error || "",
      executionTime,
      runtimeTrace: executionResult.runtimeTrace,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   PYTHON EXECUTION
========================= */

async function executePython(code, input = "", signal) {
  const pythonCommand = getPythonCommand();

  if (!pythonCommand) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "Python runtime is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so Python 3 is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  const sourceFile = path.join(tempDirectory, "main.py");

  try {
    fs.writeFileSync(sourceFile, buildPythonInstrumentedSource(code), "utf8");

    const startTime = Date.now();

    const executionResult = await runProcess(
      pythonCommand,
      [sourceFile],
      {
        cwd: tempDirectory,
        input,
        signal,
      }
    );

    const executionTime = Date.now() - startTime;
    const traced = extractRuntimeTrace(executionResult.stderr);

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        stderr: traced.stderr,
        runtimeTrace: traced.runtimeTrace,
        error:
          traced.stderr ||
          "Python program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      stderr: traced.stderr,
      runtimeTrace: traced.runtimeTrace,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   JAVA EXECUTION
========================= */

async function executeJava(code, input = "", signal) {
  if (!commandAvailable("javac") || !commandAvailable("java")) {
    return {
      success: false,
      stage: "environment",
      output: "",
      error: "Java runtime (javac/java) is not installed in the backend runtime. Deploy the Node server with server/Dockerfile so OpenJDK is available.",
      executionTime: null,
    };
  }

  const tempDirectory = createTempDirectory();

  // Java requires a public class to live in a file with the same name.
  // Support normal editor code such as "public class Solution" instead
  // of forcing every program to be named Main.
  const publicClassMatch = code.match(
    /\bpublic\s+class\s+([A-Za-z_$][\w$]*)/
  );
  const mainClassName = publicClassMatch?.[1] || "Main";
  const packageName = code.match(/^\s*package\s+([A-Za-z_$][\w$.]*)\s*;/m)?.[1] || "";
  const mainClass = packageName ? `${packageName}.${mainClassName}` : mainClassName;
  const sourceDirectory = packageName ? path.join(tempDirectory, ...packageName.split(".")) : tempDirectory;
  const sourceFile = path.join(sourceDirectory, `${mainClassName}.java`);
  const traceRunnerFile = path.join(tempDirectory, "Code3dJavaTraceRunner.java");
  const launcherFile = path.join(tempDirectory, "java-loopback-launcher.py");

  try {
    fs.mkdirSync(sourceDirectory, { recursive: true });
    fs.writeFileSync(sourceFile, code, "utf8");
    fs.writeFileSync(traceRunnerFile, buildJavaTraceRunnerSource(), "utf8");
    if (process.platform === "linux") fs.writeFileSync(launcherFile, buildLoopbackJavaLauncherSource(), "utf8");

    const compileResult = await runProcess(
      "javac",
      ["--add-modules", "jdk.jdi", "-g", "-d", tempDirectory, sourceFile, traceRunnerFile],
      {
        cwd: tempDirectory,
        timeoutMs: 15000,
        signal,
      }
    );

    if (!compileResult.success) {
      return {
        success: false,
        stage: "compile",
        output: "",
        error: compileResult.timedOut
          ? "Java compilation timed out. The backend is under heavy load; please try again."
          : compileResult.stderr || "Java compilation failed.",
        executionTime: null,
      };
    }

    const javaArgs = ["--add-modules", "jdk.jdi", "-cp", tempDirectory, "Code3dJavaTraceRunner", tempDirectory, mainClass, `${mainClass}.java`];
    const javaCommand = process.platform === "linux" ? getPythonCommand() : "java";
    if (!javaCommand) return { success: false, stage: "environment", output: "", error: "Python 3 is required to prepare the isolated loopback channel for Java runtime tracing.", executionTime: null };
    const executionArgs = process.platform === "linux" ? [launcherFile, "java", ...javaArgs] : javaArgs;
    const startTime = Date.now();
    const executionResult = await runProcess(javaCommand, executionArgs, {
      cwd: tempDirectory,
      input,
      signal,
      timeoutMs: Math.max(10000, TIME_LIMIT * 3),
    });
    const executionTime = Date.now() - startTime;
    const traced = extractRuntimeTrace(executionResult.stderr);

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        runtimeTrace: traced.runtimeTrace,
        error:
          "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        runtimeTrace: traced.runtimeTrace,
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        stderr: traced.stderr,
        runtimeTrace: traced.runtimeTrace,
        error:
          traced.stderr ||
          "Java program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      stderr: traced.stderr,
      runtimeTrace: traced.runtimeTrace,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, {
        recursive: true,
        force: true,
      });
    } catch (error) {
      console.error(
        "Temporary file cleanup failed:",
        error.message
      );
    }
  }
}


/* =========================
   JAVASCRIPT EXECUTION
========================= */

async function executeJavaScript(code, input = "", signal) {
  const tempDirectory = createTempDirectory();
  const sourceFile = path.join(tempDirectory, "main.js");
  const runnerFile = path.join(tempDirectory, "trace-runner.js");

  try {
    fs.writeFileSync(sourceFile, code, "utf8");
    fs.writeFileSync(runnerFile, buildJavaScriptTraceRunnerSource(), "utf8");

    const startTime = Date.now();
    const executionResult = await runProcess(
      process.execPath,
      [runnerFile, sourceFile],
      {
        cwd: tempDirectory,
        input,
        signal,
      }
    );
    const executionTime = Date.now() - startTime;
    const traced = extractRuntimeTrace(executionResult.stderr);

    if (executionResult.timedOut) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        error: "Time Limit Exceeded. The program may contain an infinite loop or excessive computation.",
        executionTime,
      };
    }

    if (executionResult.outputLimitExceeded) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout.slice(0, MAX_OUTPUT),
        error: "Output Limit Exceeded.",
        executionTime,
      };
    }

    if (!executionResult.success) {
      return {
        success: false,
        stage: "runtime",
        output: executionResult.stdout,
        stderr: traced.stderr,
        runtimeTrace: traced.runtimeTrace,
        error: traced.stderr || "JavaScript program terminated with an error.",
        executionTime,
      };
    }

    return {
      success: true,
      stage: "complete",
      output: executionResult.stdout,
      error: "",
      stderr: traced.stderr,
      runtimeTrace: traced.runtimeTrace,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      stage: "server",
      output: "",
      error: error.message,
      executionTime: null,
    };
  } finally {
    try {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    } catch (error) {
      console.error("Temporary file cleanup failed:", error.message);
    }
  }
}


/* =========================
   MAIN EXECUTOR
========================= */

async function executeCode(language, code, input = "", options = {}) {
  if (!code || !code.trim()) {
    return {
      success: false,
      stage: "validation",
      output: "",
      error: "Code cannot be empty.",
      executionTime: null,
    };
  }

  if (Buffer.byteLength(code, "utf8") > 100 * 1024) {
    return {
      success: false,
      stage: "validation",
      output: "",
      error: "Code exceeds the 100 KB execution limit.",
      executionTime: null,
    };
  }
  if (typeof input !== "string" || Buffer.byteLength(input, "utf8") > 20 * 1024) {
    return {
      success: false,
      stage: "validation",
      output: "",
      error: "Execution input must be a string no larger than 20 KB.",
      executionTime: null,
    };
  }

  if (!sandboxAvailable()) {
    return executeWithJudge0(language, code, input, options);
  }

  const normalizedLanguage = language
    .toLowerCase()
    .trim();

  if (
    normalizedLanguage === "c++" ||
    normalizedLanguage === "cpp"
  ) {
    return executeCpp(code, input, options.signal);
  }

  if (normalizedLanguage === "c") {
    return executeC(code, input, options.signal);
  }

  if (
    normalizedLanguage === "python" ||
    normalizedLanguage === "py"
  ) {
    return executePython(code, input, options.signal);
  }

  if (normalizedLanguage === "java") {
    return executeJava(code, input, options.signal);
  }

  if (
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "js" ||
    normalizedLanguage === "node"
  ) {
    return executeJavaScript(code, input, options.signal);
  }

  return {
    success: false,
    stage: "validation",
    output: "",
    error: `Language "${language}" is not supported yet.`,
    executionTime: null,
  };
}

module.exports = {
  executeCode,
  executeWithJudge0,
  getRuntimeAvailability,
  buildPythonInstrumentedSource,
  buildJavaScriptTraceRunnerSource,
  buildGdbTraceScript,
  buildJavaTraceRunnerSource,
  extractRuntimeTrace,
};


