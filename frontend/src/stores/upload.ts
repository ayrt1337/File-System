import { defineStore } from "pinia";
import axios from "axios";
import { api } from "../services/api";
import { API_ROUTES } from "../routing/routes";
import { getFilePreview } from "../utils/get-file-preview";
import { useToast } from "../composables/use-toast";
import { dataURLtoBlob } from "../utils/upload-helpers";

export interface FileUploadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  preview?: string;
  rawFile: File;
  cancelTokenSource?: any;
}

export const useUploadStore = defineStore("upload", {
  state: () => ({
    uploads: [] as FileUploadItem[],
    isMinimized: false,
    isVisible: false,
  }),
  getters: {
    activeUploadsCount(state) {
      return state.uploads.filter(u => u.status === 'uploading').length;
    },
    totalCount(state) {
      return state.uploads.length;
    },
    completedCount(state) {
      return state.uploads.filter(u => u.status === 'completed').length;
    },
    hasActiveUploads(state) {
      return state.uploads.some(u => u.status === 'uploading');
    }
  },
  actions: {
    async uploadFiles(files: FileList | File[]) {
      this.isVisible = true;
      this.isMinimized = false;
      
      for (const file of Array.from(files)) {
        const id = Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9);
        const preview = await getFilePreview(file);
        const cancelTokenSource = axios.CancelToken.source();

        const item: FileUploadItem = {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: 'uploading',
          preview,
          rawFile: file,
          cancelTokenSource,
        };

        this.uploads.push(item);
        this.performUpload(id);
      }
    },

    async performUpload(id: string) {
      const item = this.uploads.find(u => u.id === id);
      if (!item) return;

      try {
        item.status = 'uploading';
        item.progress = 0;
        
        const { data } = await api.post(API_ROUTES.FILE.UPLOAD_URL, {
          fileName: item.name,
          contentType: item.type,
          size: item.size,
          preview: !!item.preview,
        });

        await axios.put(data.url, item.rawFile, {
          headers: {
            "Content-Type": item.type,
          },
          cancelToken: item.cancelTokenSource?.token,
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || item.size;
            item.progress = Math.round((progressEvent.loaded * 100) / total);
          }
        });

        if (item.preview) {
          try {
            const previewBlob = await dataURLtoBlob(item.preview);
            await axios.put(data.previewUrl, previewBlob, {
              headers: {
                "Content-Type": "image/jpeg",
              },
            });
          } catch (previewErr) {
            console.error("Erro ao fazer upload do preview do arquivo:", previewErr);
          }
        }

        item.status = 'completed';
        item.progress = 100;
      } catch (error: any) {
        if (axios.isCancel(error)) {
          item.status = 'cancelled';
        } else {
          console.error("Erro no upload do arquivo:", error);
          item.status = 'error';
        }
      }
    },

    cancelUpload(id: string) {
      const item = this.uploads.find(u => u.id === id);
      if (item && item.status === 'uploading') {
        item.cancelTokenSource?.cancel("Upload cancelado pelo usuário.");
        item.status = 'cancelled';
      }
    },

    cancelAllUploads() {
      this.uploads.forEach(item => {
        if (item.status === 'uploading') {
          item.cancelTokenSource?.cancel("Upload cancelado pelo usuário.");
          item.status = 'cancelled';
        }
      });
    },

    retryUpload(id: string) {
      const item = this.uploads.find(u => u.id === id);
      if (item) {
        item.cancelTokenSource = axios.CancelToken.source();
        this.performUpload(id);
      }
    },

    clearUploads() {
      this.uploads = this.uploads.filter(u => u.status === 'uploading');
      if (this.uploads.length === 0) {
        this.isVisible = false;
      }
    },

    closeWidget() {
      const hasActive = this.uploads.some(u => u.status === 'uploading');
      if (!hasActive) {
        this.isVisible = false;
        this.uploads = [];
      } else {
        const { showToast } = useToast();
        showToast("Não é possível fechar enquanto houver uploads ativos.", "error");
      }
    },
    
    toggleMinimized() {
      this.isMinimized = !this.isMinimized;
    }
  }
});
