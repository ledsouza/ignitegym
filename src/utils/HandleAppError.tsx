import { useToast } from "@gluestack-ui/themed";
import { AppError } from "./AppError";
import { ToastMessage } from "@components/ToastMessage";

export function handleAppError(
    error: any,
    toast: ReturnType<typeof useToast>,
    genericMessage: string
) {
    const isAppError = error instanceof AppError;
    const title = isAppError ? error.message : genericMessage;

    toast.show({
        render: ({ id }) => (
            <ToastMessage
                id={id}
                title={title}
                action="error"
                onClose={() => toast.close(id)}
            />
        ),
        placement: "top",
    });
}
