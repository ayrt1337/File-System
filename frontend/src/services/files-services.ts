import { API_ROUTES } from "../routing/routes";
import { useToast } from "../composables/use-toast";
import { api } from "./api";
import { useFileCacheStore } from "../stores/file-cache";

const { showToast } = useToast();

export const useFilesServices = () => {
  const downloadFile = async (fileId: string) => {
    const cacheStore = useFileCacheStore();
    try {
      const urls = await cacheStore.getOrFetch(fileId, "download");

      if (!urls.downloadUrl) {
        throw new Error("URL de download inválida ou indisponível");
      }

      const link = document.createElement("a");
      link.href = urls.downloadUrl;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      cacheStore.invalidateDownloadUrlCache(fileId);
      showToast("Erro ao baixar o arquivo.", "error");
    }
  };

  const toggleFavorite = async (
    fileId: string,
    isFavorite: boolean,
  ): Promise<boolean> => {
    try {
      const statusText = isFavorite
        ? "adicionado aos favoritos"
        : "removido dos favoritos";
      showToast(`Arquivo ${statusText}!`, "success");

      await api.patch(API_ROUTES.FILE.FAVORITE, {
        fileId,
        isFavorite,
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao atualizar favorito:", error);
      showToast(
        error.response?.data?.message || "Erro ao atualizar favorito.",
        "error",
      );
      return false;
    }
  };

  const deleteFile = async (fileId: string): Promise<boolean> => {
    try {
      showToast("Arquivo movido para a lixeira!", "success");

      await api.patch(API_ROUTES.FILE.STATUS, {
        fileId,
        status: "TRASH",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao mover arquivo para a lixeira:", error);
      showToast(
        error.response?.data?.message ||
          "Erro ao mover o arquivo para a lixeira.",
        "error",
      );
      return false;
    }
  };

  const restoreFile = async (fileId: string): Promise<boolean> => {
    try {
      showToast("Arquivo restaurado com sucesso!", "success");

      await api.patch(API_ROUTES.FILE.STATUS, {
        fileId,
        status: "ACTIVE",
      });

      return true;
    } catch (error: any) {
      console.error("Erro ao restaurar arquivo:", error);
      showToast(
        error.response?.data?.message || "Erro ao restaurar o arquivo.",
        "error",
      );
      return false;
    }
  };

  const deletePermanentFile = async (fileId: string): Promise<boolean> => {
    try {
      await api.patch(API_ROUTES.FILE.STATUS, {
        fileId,
        status: "DELETED",
      });
      return true;
    } catch (error: any) {
      console.error("Erro ao deletar permanentemente o arquivo:", error);
      return false;
    }
  };

  return {
    downloadFile,
    toggleFavorite,
    deleteFile,
    restoreFile,
    deletePermanentFile,
  };
};
