"use client";

import { useTransition } from "react";
import { deleteChannel } from "./actions";

export function DeleteChannelButton({ channelId, channelName, contactCount }: { channelId: string; channelName: string; contactCount: number }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    const warning =
      contactCount > 0
        ? `"${channelName}" tiene ${contactCount} contacto(s) asignado(s). Si lo eliminas, esos contactos quedarán sin canal de origen. ¿Continuar?`
        : `¿Eliminar el canal "${channelName}"?`;
    if (!window.confirm(warning)) return;
    startTransition(() => {
      deleteChannel(channelId);
    });
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className="text-xs text-slate-400 hover:text-red-600">
      {pending ? "Eliminando..." : "Eliminar"}
    </button>
  );
}
