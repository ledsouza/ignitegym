import { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Center, Heading, Text, VStack, useToast } from "@gluestack-ui/themed";

import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { UserPhoto } from "@components/UserPhoto";
import { ToastMessage } from "@components/ToastMessage";
import { ScreenHeader } from "@components/ScreenHeader";

export function Profile() {
    const [userPhoto, setUserPhoto] = useState(
        "https://github.com/ledsouza.png"
    );

    const toast = useToast();

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
                        <Input placeholder="Nome" bg="$gray600" />
                        <Input
                            value="leandro@email.com"
                            bg="$gray600"
                            isReadOnly
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
                        <Input
                            placeholder="Senha antiga"
                            bg="$gray600"
                            secureTextEntry
                        />
                        <Input
                            placeholder="Nova senha"
                            bg="$gray600"
                            secureTextEntry
                        />
                        <Input
                            placeholder="Confirme a nova senha"
                            bg="$gray600"
                            secureTextEntry
                        />
                        <Button title="Atualizar" />
                    </Center>
                </Center>
            </ScrollView>
        </VStack>
    );
}
