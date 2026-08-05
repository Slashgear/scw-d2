import { DEFAULT_D2_CONFIG, type D2Config } from './d2Config'

export interface D2Document {
  id: string
  name: string
  code: string
  config: D2Config
  createdAt: number
  updatedAt: number
}

const DB_NAME = 'scw-d2'
const DB_VERSION = 1
const STORE_NAME = 'documents'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return dbPromise
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllDocuments(): Promise<D2Document[]> {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  return promisifyRequest(tx.objectStore(STORE_NAME).getAll())
}

export async function putDocument(doc: D2Document): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await promisifyRequest(tx.objectStore(STORE_NAME).put(doc))
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await promisifyRequest(tx.objectStore(STORE_NAME).delete(id))
}

const LAST_DOC_STORAGE_KEY = 'scw-d2:last-doc-id'

export function getLastOpenDocId(): string | null {
  return localStorage.getItem(LAST_DOC_STORAGE_KEY)
}

export function setLastOpenDocId(id: string) {
  localStorage.setItem(LAST_DOC_STORAGE_KEY, id)
}

function newId(): string {
  return crypto.randomUUID()
}

export function createDocument(
  name: string,
  code: string,
  config: D2Config = DEFAULT_D2_CONFIG,
): D2Document {
  const now = Date.now()
  return { id: newId(), name, code, config, createdAt: now, updatedAt: now }
}

export function duplicateDocument(doc: D2Document): D2Document {
  const now = Date.now()
  return { ...doc, id: newId(), name: `${doc.name} copy`, createdAt: now, updatedAt: now }
}

interface ExportedDocumentFile {
  kind: 'document'
  version: 1
  name: string
  code: string
  config: D2Config
}

interface ExportedLibraryFile {
  kind: 'library'
  version: 1
  documents: Array<{ name: string; code: string; config: D2Config }>
}

function isD2Config(value: unknown): value is D2Config {
  if (!value || typeof value !== 'object') return false
  const c = value as Record<string, unknown>
  return (
    (c.diagramTheme === 'scaleway' || typeof c.diagramTheme === 'number') &&
    (c.layout === 'dagre' || c.layout === 'elk') &&
    typeof c.sketch === 'boolean'
  )
}

function isExportedDocumentFile(value: unknown): value is ExportedDocumentFile {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.kind === 'document' &&
    typeof v.name === 'string' &&
    typeof v.code === 'string' &&
    isD2Config(v.config)
  )
}

function isExportedLibraryFile(value: unknown): value is ExportedLibraryFile {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    v.kind === 'library' &&
    Array.isArray(v.documents) &&
    v.documents.every(
      (d) =>
        d &&
        typeof d === 'object' &&
        typeof (d as Record<string, unknown>).name === 'string' &&
        typeof (d as Record<string, unknown>).code === 'string' &&
        isD2Config((d as Record<string, unknown>).config),
    )
  )
}

/** Parses a `.json` export (single document or whole library) into fresh, ready-to-persist documents. */
export async function parseImportedFile(file: File): Promise<D2Document[]> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Not a valid JSON file')
  }

  if (isExportedDocumentFile(parsed)) {
    return [createDocument(parsed.name, parsed.code, parsed.config)]
  }
  if (isExportedLibraryFile(parsed)) {
    return parsed.documents.map((d) => createDocument(d.name, d.code, d.config))
  }
  throw new Error('Unrecognized file format — expected a scw-d2 document or library export')
}
