@echo off
setlocal
set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.12"
set "PATH=%JAVA_HOME%\bin;%PATH%"
"%~dp0.mvn\apache-maven\bin\mvn.cmd" %*
