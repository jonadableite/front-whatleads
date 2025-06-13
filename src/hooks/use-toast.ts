// hooks/use-toast.ts

// Inspired by react-hot-toast library
import * as React from "react";

// Remova esta importação, pois definiremos ToastProps localmente
// import type { ToastProps } from "@/components/ui/toast"

// Defina a interface ToastProps com as propriedades que o hook espera gerenciar
// Inclua 'variant' aqui
interface ToastProps {
  id: string; // O hook gera o ID
  open: boolean; // O hook gerencia o estado de aberto/fechado
  onOpenChange: (open: boolean) => void; // O hook lida com a mudança de estado
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  // Adicione a propriedade 'variant' com os tipos esperados
  variant?: "default" | "destructive" | "success" | "warning" | "info"; // Exemplo de variantes
  // Adicione quaisquer outras propriedades que seu componente de toast real espera
  // Ex: className, duration, etc.
}


// O tipo usado internamente pelo estado do reducer
// Agora é o mesmo que ToastProps, pois ToastProps inclui id, open, onOpenChange
type ToasterToast = ToastProps;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

// Defina o limite máximo de toasts exibidos simultaneamente
const TOAST_LIMIT = 5;

// Defina o tempo de remoção do toast em milissegundos (exemplo: 1000ms = 1s)
const TOAST_REMOVE_DELAY = 1000;

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    clearTimeout(toastTimeouts.get(toastId))
    toastTimeouts.delete(toastId)
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast as ToasterToast } : t // Cast para garantir tipo correto na mesclagem
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// O tipo para o argumento passado para a função `toast`
// Ele omite as propriedades que são gerenciadas internamente pelo hook (`id`, `open`, `onOpenChange`)
type Toast = Omit<ToasterToast, "id" | "open" | "onOpenChange">

function toast({ ...props }: Toast) {
  const id = genId()

  // O tipo para a função update deve ser Partial<Omit<ToasterToast, "id">>
  const update = (props: Partial<Omit<ToasterToast, "id">>) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id } as Partial<ToasterToast>, // Cast para Partial<ToasterToast>
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props, // 'variant' agora é uma propriedade conhecida aqui se for passada
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    } as ToasterToast, // Cast para garantir que o objeto criado corresponda ao tipo ToasterToast
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state]) // Dependência [state] pode não ser necessária aqui, listeners manipulam memoryState

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { toast, useToast };


