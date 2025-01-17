import { ScrollView, TouchableOpacity } from "react-native";
import { Center, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";
import { Controller, useForm } from "react-hook-form";

import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as yup from "yup";

import defaulUserPhotoImg from "@assets/userPhotoDefault.png";

import { useAuth } from "@hooks/useAuth";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { UserPhoto } from "@components/UserPhoto";
import { ToastMessage } from "@components/ToastMessage";
import { ScreenHeader } from "@components/ScreenHeader";
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import { handleAppError } from "@utils/HandleAppError";

type FormDataProps = {
    name: string;
    email: string;
    old_password?: string;
    password?: string;
    confirm_password?: string;
};

const profileSchema = yup.object({
    name: yup.string().required("Informe o nome"),
    email: yup.string().required(),
    old_password: yup
        .string()
        .optional()
        .transform((value) => (value.trim() === "" ? undefined : value)),
    password: yup
        .string()
        .min(6, "A senha deve ter pelo menos 6 dígitos.")
        .optional()
        .transform((value) => (value.trim() === "" ? undefined : value)),
    confirm_password: yup
        .string()
        .optional()
        .transform((value) => (value.trim() === "" ? undefined : value))
        .oneOf(
            [yup.ref("password"), undefined],
            "A confirmação de senha não confere."
        )
        .when("password", {
            is: (val: string | undefined) =>
                val !== undefined && val.length > 0,
            then: (schema) =>
                schema
                    .required("Informe a confirmação da senha.")
                    .transform((value) =>
                        value.trim() === "" ? undefined : value
                    ),
        }),
});

export function Profile() {
    const toast = useToast();

    const { user, updateUserProfile } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email,
        },
        resolver: yupResolver(profileSchema),
    });

    async function handleUserPhotoSelect() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
            });

            if (result.canceled) {
                return;
            }

            const photoSelected = result.assets[0];

            if (photoSelected.uri) {
                const photoInfo = (await FileSystem.getInfoAsync(
                    photoSelected.uri
                )) as {
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

                const photoFile = {
                    name: photoSelected.fileName,
                    uri: photoSelected.uri,
                    type: photoSelected.mimeType,
                } as any;

                const userPhotoUploadForm = new FormData();
                userPhotoUploadForm.append("avatar", photoFile);

                const avatarUpdtedResponse = await api.patch(
                    "/users/avatar",
                    userPhotoUploadForm,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                const userUpdated = user;
                userUpdated.avatar = avatarUpdtedResponse.data.avatar;
                updateUserProfile(userUpdated);

                toast.show({
                    render: ({ id }) => (
                        <ToastMessage
                            id={id}
                            title="Foto atualizada!"
                            action="success"
                            onClose={() => toast.close(id)}
                        />
                    ),
                    placement: "top",
                });
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function handleProfileUpdate(data: FormDataProps) {
        try {
            const userUpdated = user;
            userUpdated.name = data.name;

            await api.put("/users", data);
            await updateUserProfile(userUpdated);

            toast.show({
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        title={"Perfil atualizado com sucesso!"}
                        action="success"
                        onClose={() => toast.close(id)}
                    />
                ),
                placement: "top",
            });
        } catch (error) {
            handleAppError(
                error,
                toast,
                "Não foi possível atualizar os dados. Tente novamente mais tarde."
            );
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />

            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt="$6" px="$10">
                    <UserPhoto
                        source={
                            user.avatar
                                ? {
                                      uri: `${api.defaults.baseURL}/avatar/${user.avatar}`,
                                  }
                                : defaulUserPhotoImg
                        }
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
                            name="password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Nova senha"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={errors.password?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="confirm_password"
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Confirme a nova senha"
                                    bg="$gray600"
                                    onChangeText={onChange}
                                    secureTextEntry
                                    errorMessage={
                                        errors.confirm_password?.message
                                    }
                                />
                            )}
                        />

                        <Button
                            title="Atualizar"
                            onPress={handleSubmit(handleProfileUpdate)}
                            isLoading={isSubmitting}
                        />
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    );
}
