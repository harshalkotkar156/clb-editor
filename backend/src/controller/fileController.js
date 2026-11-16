import mongoose from 'mongoose';
import File from '../models/File.js';
import Execution from '../models/Execution.js';

const ALLOWED_LANGUAGES = ['cpp', 'java', 'python', 'javascript', 'c'];

// ─────────────────────────────────────────
// GET ALL FILES
// ─────────────────────────────────────────
export const getAllFiles = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id })
      .sort({ lastOpenedAt: -1 })
      .select('-code');

    return res.json(files);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch files' });
  }
};

// ─────────────────────────────────────────
// CREATE FILE
// ─────────────────────────────────────────
export const createFile = async (req, res) => {
  try {
    const { name, language, code } = req.body;

    if (!language) {
      return res.status(400).json({ error: 'language is required' });
    }

    if (!ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported: ${ALLOWED_LANGUAGES.join(', ')}`
      });
    }

    const trimmedName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : 'Untitled';

    const file = await File.create({
      owner: req.user._id,
      name: trimmedName,
      language,
      code: typeof code === 'string' ? code : getDefaultCode(language)
    });

    return res.status(201).json(file);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create file' });
  }
};

// ─────────────────────────────────────────
// GET SINGLE FILE
// ─────────────────────────────────────────
export const getFileById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    file.lastOpenedAt = new Date();
    await file.save();

    return res.json(file);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch file' });
  }
};

// ─────────────────────────────────────────
// UPDATE FILE
// ─────────────────────────────────────────
export const updateFile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const { name, code, language } = req.body;

    if (language !== undefined && !ALLOWED_LANGUAGES.includes(language)) {
      return res.status(400).json({
        error: `Unsupported language: ${language}. Supported: ${ALLOWED_LANGUAGES.join(', ')}`
      });
    }

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (name !== undefined) {
      file.name = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : 'Untitled';
    }
    if (code !== undefined) file.code = code;
    if (language !== undefined) file.language = language;

    await file.save();

    return res.json(file);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update file' });
  }
};

// ─────────────────────────────────────────
// DELETE FILE
// ─────────────────────────────────────────
export const deleteFile = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await File.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Cascade delete any executions associated with this file
    await Execution.deleteMany({ file: req.params.id }).catch(() => {});

    return res.json({ message: 'File deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete file' });
  }
};

// ─────────────────────────────────────────
// GET EXECUTIONS
// ─────────────────────────────────────────
export const getFileExecutions = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const executions = await Execution.find({ file: req.params.id, user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-code');

    return res.json(executions);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch executions' });
  }
};

// ─────────────────────────────────────────
// DEFAULT CODE FUNCTION
// ─────────────────────────────────────────
function getDefaultCode(language) {
  const templates = {
    python: `# Python\nprint("Hello, World!")`,
    javascript: `// JavaScript\nconsole.log("Hello, World!");`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    cpp: `#include<iostream>\n#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    cout<<"Hello, World!"<<endl;\n    return 0;\n}`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`
  };
  return templates[language] || '';
}