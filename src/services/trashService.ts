import api from "@/api/axiosInstance";

export const trashService = {
  getTrashedItems: async (workspaceId?: string | null) => {
    const params: any = {};
    if (workspaceId) params.workspaceId = workspaceId;

    const [foldersRes, filesRes] = await Promise.all([
      api.get("/folders/trash", { params }),
      api.get("/files/trash", { params })
    ]);

    return {
      folders: foldersRes.data.data || [],
      documents: filesRes.data.data || []
    };
  },

  forceDelete: async (id: string, kind: "folder" | "document") => {
    if (kind === "folder") {
      await api.delete(`/folders/${id}/force`);
    } else {
      await api.delete(`/files/${id}/force`);
    }
  },

  emptyTrash: async () => {
    await Promise.all([
      api.delete("/folders/trash/empty").catch(e => console.log(e)),
      api.delete("/files/trash/empty").catch(e => console.log(e))
    ]);
  },

  restoreItem: async (id: string, kind: "folder" | "document") => {
    if (kind === "folder") {
      const res = await api.put(`/folders/${id}/restore`);
      return res.data;
    } else {
      const res = await api.put(`/files/${id}/restore`);
      return res.data;
    }
  }
};