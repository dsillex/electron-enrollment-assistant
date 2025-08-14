import { ipcMain, dialog } from 'electron'
import * as fs from 'fs-extra'
import * as path from 'node:path'

export function registerFileHandlers() {
  // Open file dialog
  ipcMain.handle('file:open', async (_, filters?: { name: string; extensions: string[] }[]) => {
    try {
      const defaultFilters = [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'Word Documents', extensions: ['docx', 'doc'] },
        { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
        { name: 'All Files', extensions: ['*'] }
      ]

      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters || defaultFilters,
        title: 'Select Document to Open'
      })

      if (result.canceled) {
        return null
      }

      const filePath = result.filePaths[0]
      const fileInfo = {
        path: filePath,
        name: path.basename(filePath),
        extension: path.extname(filePath).toLowerCase(),
        size: (await fs.stat(filePath)).size,
        type: getFileType(path.extname(filePath).toLowerCase())
      }

      return fileInfo
    } catch (error) {
      console.error('Failed to open file:', error)
      throw new Error('Failed to open file')
    }
  })

  // Save file dialog
  ipcMain.handle('file:save', async (_, data: any, defaultPath?: string) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultPath || 'document',
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] },
          { name: 'Word Documents', extensions: ['docx'] },
          { name: 'Excel Files', extensions: ['xlsx'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        title: 'Save Document'
      })

      if (result.canceled || !result.filePath) {
        return null
      }

      await fs.writeFile(result.filePath, data)
      return result.filePath
    } catch (error) {
      console.error('Failed to save file:', error)
      throw new Error('Failed to save file')
    }
  })

  // Read file content
  ipcMain.handle('file:read', async (_, filePath: string) => {
    try {
      const content = await fs.readFile(filePath)
      return content
    } catch (error) {
      console.error('Failed to read file:', error)
      throw new Error('Failed to read file')
    }
  })

  // Get file info
  ipcMain.handle('file:getInfo', async (_, filePath: string) => {
    try {
      const stats = await fs.stat(filePath)
      return {
        path: filePath,
        name: path.basename(filePath),
        extension: path.extname(filePath).toLowerCase(),
        size: stats.size,
        type: getFileType(path.extname(filePath).toLowerCase()),
        lastModified: stats.mtime,
        created: stats.birthtime
      }
    } catch (error) {
      console.error('Failed to get file info:', error)
      throw new Error('Failed to get file information')
    }
  })
}

function getFileType(extension: string): string {
  switch (extension) {
    case '.pdf':
      return 'pdf'
    case '.docx':
    case '.doc':
      return 'word'
    case '.xlsx':
    case '.xls':
      return 'excel'
    default:
      return 'unknown'
  }
}