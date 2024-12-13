import { useNavigation } from "@react-navigation/native";
import {
    Center,
    Heading,
    Image,
    ScrollView,
    Text,
    useToast,
    VStack,
} from "@gluestack-ui/themed";

import { AuthNavigatorRoutesProps } from "@routes/auth.routes";

import { AppError } from "@utils/AppError";

import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";

import BackgroundImg from "@assets/background.png";
import Logo from "@assets/logo.svg";

import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { ToastMessage } from "@components/ToastMessage";
import { useState } from "react";

type FormData = {
    email: string;
    password: string;
};

export function SignIn() {
    const navigation = useNavigation<AuthNavigatorRoutesProps>();

    const { signIn } = useAuth();

    const toast = useToast();

    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    function handleNewAccount() {
        navigation.navigate("signUp");
    }

    async function handleSignIn({ email, password }: FormData) {
        try {
            setIsLoading(true);
            await signIn(email, password);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError
                ? error.message
                : "Não foi possível entrar. Tente novamente mais tarde.";

            setIsLoading(false);

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
    }

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <VStack flex={1}>
                <Image
                    w="$full"
                    h={624}
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt="Pessoas treinando"
                    position="absolute"
                />

                <VStack flex={1} px="$10" pb="$16">
                    <Center my="$24">
                        <Logo />
                        <Text color="$gray100" fontSize="$sm">
                            Treine sua mente e seu corpo
                        </Text>
                    </Center>

                    <Center gap="$2">
                        <Heading color="$gray100">Acesse sua conta</Heading>

                        <Controller
                            control={control}
                            name="email"
                            rules={{ required: "Informe o e-mail" }}
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="E-mail"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    onChangeText={onChange}
                                    errorMessage={errors.email?.message}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            rules={{ required: "Informe a senha" }}
                            render={({ field: { onChange } }) => (
                                <Input
                                    placeholder="Senha"
                                    secureTextEntry
                                    onChangeText={onChange}
                                    errorMessage={errors.password?.message}
                                />
                            )}
                        />

                        <Button
                            title="Acessar"
                            onPress={handleSubmit(handleSignIn)}
                            isLoading={isLoading}
                        />
                    </Center>

                    <Center flex={1} justifyContent="flex-end" marginTop="$4">
                        <Text
                            color="$gray100"
                            fontSize="$sm"
                            fontFamily="$body"
                            marginBottom="$1"
                        >
                            Ainda não tem acesso?
                        </Text>
                        <Button
                            title="Criar conta"
                            variant="outline"
                            onPress={handleNewAccount}
                        />
                    </Center>
                </VStack>
            </VStack>
        </ScrollView>
    );
}
