import { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Center, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";
import { Controller, useForm } from "react-hook-form";

import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as yup from "yup";

import { useAuth } from "@hooks/useAuth";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { UserPhoto } from "@components/UserPhoto";
import { ToastMessage } from "@components/ToastMessage";
import { ScreenHeader } from "@components/ScreenHeader";
import { yupResolver } from "@hookform/resolvers/yup";

type FormDataProps = {
    name: string;
    email: string;
    old_password?: string | null;
    new_password?: string | null;
    confirm_new_password?: string | null;
};

const profileSchema = yup.object({
    name: yup.string().required("Informe o nome"),
    email: yup.string().required(),
    old_password: yup
        .string()
        .nullable()
        .transform((value) => (!!value ? value : null)),
    new_password: yup
        .string()
        .min(6, "A senha deve ter pelo menos 6 dígitos.")
        .nullable()
        .transform((value) => (!!value ? value : null)),
    confirm_new_password: yup
        .string()
        .nullable()
        .transform((value) => (!!value ? value : null))
        .oneOf(
            [yup.ref("new_password"), null],
            "A confirmação de senha não confere."
        )
        .when("new_password", {
            is: (val: string | null) => val !== null && val.length > 0,
            then: (schema) =>
                schema.required("Informe a confirmação da senha."),
        }),
});

export function Profile() {
    const [userPhoto, setUserPhoto] = useState(
        "https://github.com/ledsouza.png"
    );

    const toast = useToast();

    const { user } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email,
        },
        resolver: yupResolver(profileSchema),
    });

    async function handleUserPhotoSelect() {
        try {
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
            });

            if (photoSelected.canceled) {
                return;
            }

            const photoUri = photoSelected.assets[0].uri;

            if (photoUri) {
                const photoInfo = (await FileSystem.getInfoAsync(photoUri)) as {
                    size: number;
                };

                if (photoInfo.size && photoInfo.size / 1024 / 1024 > 5) {
                    return toast.show({
                        placement: "top",
                        render: ({ id }) => (
                            <ToastMessage
                                id={id}
                                title="Essa imagem é muito grande. Escolha uma de até 5MB"
                                action="error"
                                onClose={() => toast.close(id)}
                            />
                        ),
                    });
                }

                setUserPhoto(photoSelected.assets[0].uri);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {
        console.log(data);
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />

            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt="$6" px="$10">
                    <UserPhoto
                        source={{ uri: userPhoto }}
                        size="xl"
                        alt="Imagem do usuário"
                    />

                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text
                            color="$green500"
                            fontFamily="$heading"
                            fontSize="$md"
                            mt="$2"
                            mb="$8"
                        >
                            Alterar Foto
                        </Text>
                    </TouchableOpacity>

                    <Center w="$full" gap="$4">
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { value, onChange } }) => (
                                <Input
                                    placeholder="Nome"
                                    bg="$gray600"
                                    value={value}
                                    onChangeText={onChange}
                                    errorMessage={errors.name?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { value } }) => (
                                <Input bg="$gray600" value={value} isReadOnly />
                            )}
                        />
                    </Center>

                    <Heading
                        alignSelf="flex-start"
                        fontFamily="$heading"
                        color="$gray200"
                        fontSize="$md"
                        mt="$12"
                        mb="$2"
                    >
                        Alterar senha
                    </Heading>

                    <Center w="$full" gap="$4">
                        <Controller
                            control={control}
                            name="old_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Senha antiga"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={errors.old_password?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="new_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Nova senha"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={errors.new_password?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="confirm_new_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Confirme a nova senha"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={
                                        errors.confirm_new_password?.message
                                    }
                                />
                            )}
                        />

                        <Button
                            title="Atualizar"
                            onPress={handleSubmit(handleProfileUpdate)}
                        />
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    );
}
