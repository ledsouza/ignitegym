import { ComponentProps } from "react";
import { Image } from "@gluestack-ui/themed";

type Props = ComponentProps<typeof Image>;

export function UserPhoto({ ...props }: Props) {
    return (
        <Image
            rounded="$full"
            borderWidth="$2"
            borderColor="$gray400"
            backgroundColor="$gray500"
            {...props}
        />
    );
}
