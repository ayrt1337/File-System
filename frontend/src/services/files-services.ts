import { API_ROUTES, getRouteWithPathParams, PARAMS } from "../routing/routes";
import { useToast } from "../composables/use-toast";
import { api } from "./api";

const { showToast } = useToast();

export const useFilesServices = () => {
  const downloadFile = async (fileId: string) => {
    try {
      const path = getRouteWithPathParams(API_ROUTES.FILE.DOWNLOAD, {
        [PARAMS.ID]: fileId,
      });
      const { data } = await api.get(path);
      const link = document.createElement("a");
      link.href = data.url;
      link.setAttribute("download", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
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

  return {
    downloadFile,
    toggleFavorite,
    deleteFile,
    restoreFile
  }
};
