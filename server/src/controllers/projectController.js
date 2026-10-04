import { getPrisma, isDbOnline } from '../db.js';

export const memoryProjects = [];

/**
 * GET /api/projects
 * Get all saved projects belonging to the authenticated user
 */
export async function getProjects(req, res) {
  try {
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const items = await prisma.savedVisualization.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
      return res.json({
        success: true,
        projects: items.map((p) => ({
          id: p.id,
          userId: p.userId,
          name: p.title,
          code: p.code,
          language: p.language,
          visualizationType: p.algorithm || 'array',
          metadata: p.configJson,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      });
    }

    const userProjects = memoryProjects.filter((p) => p.userId === userId);
    return res.json({ success: true, projects: userProjects });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'PROJECTS_FETCH_ERROR',
        message: 'Failed to retrieve projects.',
      },
    });
  }
}

/**
 * GET /api/projects/:id
 * Get single project with strict ownership check
 */
export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const item = await prisma.savedVisualization.findUnique({ where: { id } });

      if (!item || item.userId !== userId) {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or unauthorized.',
          },
        });
      }

      return res.json({
        success: true,
        project: {
          id: item.id,
          userId: item.userId,
          name: item.title,
          code: item.code,
          language: item.language,
          visualizationType: item.algorithm || 'array',
          metadata: item.configJson,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
      });
    }

    const found = memoryProjects.find((p) => p.id === id && p.userId === userId);
    if (!found) {
      return res.status(404).json({
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or unauthorized.',
        },
      });
    }

    return res.json({ success: true, project: found });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'PROJECT_FETCH_ERROR',
        message: 'Failed to retrieve project details.',
      },
    });
  }
}

/**
 * POST /api/projects
 * Create a new project for the authenticated user
 */
export async function createProject(req, res) {
  try {
    const userId = req.user.id;
    const { name, title, code, language = 'java', visualization_type = 'array', metadata = null } = req.body;
    const projectName = name || title;

    if (!projectName || !code) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PROJECT_DATA',
          message: 'Project name and code are required.',
        },
      });
    }

    if (isDbOnline()) {
      const prisma = getPrisma();
      const created = await prisma.savedVisualization.create({
        data: {
          userId,
          title: projectName,
          language,
          code,
          algorithm: visualization_type,
          configJson: metadata,
        },
      });
      return res.status(201).json({
        success: true,
        project: {
          id: created.id,
          userId: created.userId,
          name: created.title,
          code: created.code,
          language: created.language,
          visualizationType: created.algorithm,
          metadata: created.configJson,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        },
      });
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      userId,
      name: projectName,
      code,
      language,
      visualizationType: visualization_type,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryProjects.unshift(newProject);
    return res.status(201).json({ success: true, project: newProject });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'PROJECT_CREATE_ERROR',
        message: 'Failed to save project.',
      },
    });
  }
}

/**
 * PUT /api/projects/:id
 * Update project with ownership check
 */
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, title, code, language, visualization_type, metadata } = req.body;
    const projectName = name || title;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const existing = await prisma.savedVisualization.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or unauthorized.',
          },
        });
      }

      const updated = await prisma.savedVisualization.update({
        where: { id },
        data: {
          title: projectName ?? existing.title,
          language: language ?? existing.language,
          code: code ?? existing.code,
          algorithm: visualization_type ?? existing.algorithm,
          configJson: metadata ?? existing.configJson,
        },
      });
      return res.json({
        success: true,
        project: {
          id: updated.id,
          userId: updated.userId,
          name: updated.title,
          code: updated.code,
          language: updated.language,
          visualizationType: updated.algorithm,
          metadata: updated.configJson,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      });
    }

    const item = memoryProjects.find((p) => p.id === id && p.userId === userId);
    if (!item) {
      return res.status(404).json({
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found or unauthorized.',
        },
      });
    }

    if (projectName !== undefined) item.name = projectName;
    if (language !== undefined) item.language = language;
    if (code !== undefined) item.code = code;
    if (visualization_type !== undefined) item.visualizationType = visualization_type;
    if (metadata !== undefined) item.metadata = metadata;
    item.updatedAt = new Date();

    return res.json({ success: true, project: item });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'PROJECT_UPDATE_ERROR',
        message: 'Failed to update project.',
      },
    });
  }
}

/**
 * DELETE /api/projects/:id
 * Delete project with ownership check
 */
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const existing = await prisma.savedVisualization.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or unauthorized.',
          },
        });
      }

      await prisma.savedVisualization.delete({ where: { id } });
      return res.json({ success: true, message: 'Project deleted successfully.' });
    }

    const idx = memoryProjects.findIndex((p) => p.id === id && p.userId === userId);
    if (idx !== -1) {
      memoryProjects.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'PROJECT_DELETE_ERROR',
        message: 'Failed to delete project.',
      },
    });
  }
}
