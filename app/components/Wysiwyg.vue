<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

const modelValue = defineModel<string>({ default: '' })

const { upload } = useMedia()
const toast = useToast()
const { t } = useI18n()
const uploading = ref(false)

const editor = useEditor({
  content: modelValue.value,
  extensions: [
    StarterKit,
    Image.configure({ inline: false, allowBase64: false }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[220px] p-4',
    },
  },
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML()
  },
})

// Keep the editor in sync when the bound value changes from the outside
// (e.g. loading an existing post into the form).
watch(modelValue, (value) => {
  if (!editor.value) return
  if ((value || '') !== editor.value.getHTML()) {
    editor.value.commands.setContent(value || '', { emitUpdate: false })
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

async function addImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    uploading.value = true
    try {
      const media = await upload(file)
      editor.value?.chain().focus().setImage({ src: media.url }).run()
    }
    catch (err) {
      toast.add({ title: parseApiError(err).message, color: 'error' })
    }
    finally {
      uploading.value = false
    }
  }
  input.click()
}

interface ToolbarButton {
  icon: string
  label: string
  isActive?: () => boolean
  run: () => void
}

const toolbar = computed<ToolbarButton[]>(() => [
  { icon: 'i-lucide-bold', label: t('editor.toolbarBold'), isActive: () => !!editor.value?.isActive('bold'), run: () => editor.value?.chain().focus().toggleBold().run() },
  { icon: 'i-lucide-italic', label: t('editor.toolbarItalic'), isActive: () => !!editor.value?.isActive('italic'), run: () => editor.value?.chain().focus().toggleItalic().run() },
  { icon: 'i-lucide-underline', label: t('editor.toolbarUnderline'), isActive: () => !!editor.value?.isActive('underline'), run: () => editor.value?.chain().focus().toggleUnderline().run() },
  { icon: 'i-lucide-strikethrough', label: t('editor.toolbarStrike'), isActive: () => !!editor.value?.isActive('strike'), run: () => editor.value?.chain().focus().toggleStrike().run() },
  { icon: 'i-lucide-heading-2', label: t('editor.toolbarH2'), isActive: () => !!editor.value?.isActive('heading', { level: 2 }), run: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: 'i-lucide-heading-3', label: t('editor.toolbarH3'), isActive: () => !!editor.value?.isActive('heading', { level: 3 }), run: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run() },
  { icon: 'i-lucide-list', label: t('editor.toolbarBulletList'), isActive: () => !!editor.value?.isActive('bulletList'), run: () => editor.value?.chain().focus().toggleBulletList().run() },
  { icon: 'i-lucide-list-ordered', label: t('editor.toolbarOrderedList'), isActive: () => !!editor.value?.isActive('orderedList'), run: () => editor.value?.chain().focus().toggleOrderedList().run() },
  { icon: 'i-lucide-quote', label: t('editor.toolbarQuote'), isActive: () => !!editor.value?.isActive('blockquote'), run: () => editor.value?.chain().focus().toggleBlockquote().run() },
  { icon: 'i-lucide-code', label: t('editor.toolbarCodeBlock'), isActive: () => !!editor.value?.isActive('codeBlock'), run: () => editor.value?.chain().focus().toggleCodeBlock().run() },
])
</script>

<template>
  <div class="wysiwyg">
    <!-- Toolbar -->
    <div class="wysiwyg__toolbar">
      <button
        v-for="btn in toolbar"
        :key="btn.icon"
        type="button"
        class="wysiwyg__btn"
        :class="{ 'wysiwyg__btn--active': btn.isActive?.() }"
        :aria-label="btn.label"
        :title="btn.label"
        @click="btn.run()"
      >
        <UIcon :name="btn.icon" class="size-4" />
      </button>

      <span class="wysiwyg__divider" />

      <button
        type="button"
        class="wysiwyg__btn"
        :aria-label="$t('editor.toolbarInsertImage')"
        :title="$t('editor.toolbarInsertImage')"
        :disabled="uploading"
        @click="addImage"
      >
        <UIcon
          :name="uploading ? 'i-lucide-loader-circle' : 'i-lucide-image'"
          class="size-4"
          :class="{ 'animate-spin': uploading }"
        />
      </button>

      <span class="wysiwyg__divider" />

      <button
        type="button"
        class="wysiwyg__btn"
        :aria-label="$t('editor.toolbarUndo')"
        :title="$t('editor.toolbarUndo')"
        @click="editor?.chain().focus().undo().run()"
      >
        <UIcon name="i-lucide-undo-2" class="size-4" />
      </button>
      <button
        type="button"
        class="wysiwyg__btn"
        :aria-label="$t('editor.toolbarRedo')"
        :title="$t('editor.toolbarRedo')"
        @click="editor?.chain().focus().redo().run()"
      >
        <UIcon name="i-lucide-redo-2" class="size-4" />
      </button>
    </div>

    <EditorContent :editor="editor" class="wysiwyg__content" />
  </div>
</template>

<style scoped>
.wysiwyg {
  overflow: hidden;
  border: 1px solid var(--hairline);
  border-radius: 12px;
  background: var(--surface-card);
}

.wysiwyg__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.125rem;
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--hairline);
  background: var(--canvas-soft);
}

.wysiwyg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  color: var(--muted);
  transition: color 0.15s ease, background-color 0.15s ease;
}

.wysiwyg__btn:hover {
  color: var(--ink);
  background: var(--surface-strong);
}

.wysiwyg__btn--active {
  color: var(--ink);
  background: var(--surface-strong);
}

.wysiwyg__btn:disabled {
  cursor: default;
  opacity: 0.5;
}

.wysiwyg__btn:focus-visible {
  outline: 2px solid var(--ink);
  outline-offset: -2px;
}

.wysiwyg__divider {
  width: 1px;
  height: 1.25rem;
  margin: 0 0.25rem;
  background: var(--hairline-strong);
}

.wysiwyg__content :deep(.ProseMirror) {
  min-height: 260px;
  max-width: 44rem;
  padding: 1.35rem 1.6rem;
  color: var(--body);
  outline: none;
}

.wysiwyg__content :deep(.ProseMirror h2),
.wysiwyg__content :deep(.ProseMirror h3) {
  font-family: var(--font-display);
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.wysiwyg__content :deep(.ProseMirror p),
.wysiwyg__content :deep(.ProseMirror li) {
  color: var(--body);
}

.wysiwyg__content :deep(.ProseMirror blockquote) {
  padding-left: 1rem;
  border-left: 2px solid var(--hairline-strong);
  color: var(--muted);
  font-style: italic;
}

.wysiwyg__content :deep(.ProseMirror pre) {
  padding: 0.9rem 1.1rem;
  border-radius: 10px;
  background: var(--surface-strong);
  color: var(--ink);
}

.wysiwyg__content :deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

.wysiwyg__content :deep(.ProseMirror p.is-editor-empty:first-child)::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
  color: var(--muted-soft);
}
</style>
