import React from "react";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

import { AppNavigatorRoutesProps } from "@routes/app.routes";
import {
    Box,
    Heading,
    HStack,
    Icon,
    Text,
    useToast,
    VStack,
} from "@gluestack-ui/themed";
import { Image } from "expo-image";
import { ArrowLeft } from "lucide-react-native";

import { ExerciseDTO } from "@dtos/ExerciseDTO";

import { api } from "@services/api";

import BodySvg from "@assets/body.svg";
import SeriesSvg from "@assets/series.svg";
import RepetitionsSvg from "@assets/repetitions.svg";

import { AppError } from "@utils/AppError";

import { Button } from "@components/Button";
import { ToastMessage } from "@components/ToastMessage";
import Loading from "@components/Loading";

type RouteParamsProps = {
    exerciseId: string;
};

export function Exercise() {
    const navigation = useNavigation<AppNavigatorRoutesProps>();
    const route = useRoute();

    const { exerciseId } = route.params as RouteParamsProps;

    const toast = useToast();

    const [sendingRegister, setSendingRegister] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO);

    function handleGoBack() {
        navigation.goBack();
    }

    async function fetchExerciseDetails() {
        try {
            setIsLoading(true);
            const response = await api.get(`/exercises/${exerciseId}`);
            setExercise(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError
                ? error.message
                : "Não foi possível carregar os detalhes do exercício.";
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
        } finally {
            setIsLoading(false);
        }
    }

    async function handleExerciseHistoryRegister() {
        try {
            setSendingRegister(true);

            await api.post("/history", { exercise_id: exerciseId });

            toast.show({
                render: ({ id }) => (
                    <ToastMessage
                        id={id}
                        title="Parabéns! Exercício registrado no seu histórico."
                        action="success"
                        onClose={() => toast.close(id)}
                    />
                ),
                placement: "top",
            });

            navigation.navigate("history");
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError
                ? error.message
                : "Não foi possível salvar o exercício.";
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
        } finally {
            setSendingRegister(false);
        }
    }

    useEffect(() => {
        fetchExerciseDetails();
    }, [exerciseId]);

    return (
        <VStack flex={1}>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <VStack px="$8" bg="$gray600" pt="$12">
                        <TouchableOpacity onPress={handleGoBack}>
                            <Icon as={ArrowLeft} color="$green500" size="xl" />
                        </TouchableOpacity>

                        <HStack
                            justifyContent="space-between"
                            alignItems="center"
                            mt="$4"
                            mb="$8"
                        >
                            <Heading
                                color="$gray100"
                                fontFamily="$heading"
                                fontSize="$lg"
                                flexShrink={1}
                            >
                                {exercise.name}
                            </Heading>

                            <HStack alignItems="center">
                                <BodySvg />
                                <Text
                                    color="$gray200"
                                    ml="$1"
                                    textTransform="capitalize"
                                >
                                    {exercise.group}
                                </Text>
                            </HStack>
                        </HStack>
                    </VStack>

                    <ScrollView>
                        <VStack p="$8">
                            <Box
                                rounded="$lg"
                                w="$full"
                                h="$80"
                                mb="$3"
                                overflow="hidden"
                            >
                                <Image
                                    source={{
                                        uri: `${api.defaults.baseURL}/exercise/demo/${exercise?.demo}`,
                                    }}
                                    alt="Exercício"
                                    contentFit="cover"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            </Box>

                            <Box bg="$gray600" rounded="$md" pb="$4" px="$4">
                                <HStack
                                    alignItems="center"
                                    justifyContent="space-around"
                                    mb="$6"
                                    mt="$5"
                                >
                                    <HStack
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <SeriesSvg />
                                        <Text color="$gray200" ml="$2">
                                            {exercise.series} séries
                                        </Text>
                                    </HStack>

                                    <HStack
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <RepetitionsSvg />
                                        <Text color="$gray200" ml="$2">
                                            {exercise.repetitions} repetições
                                        </Text>
                                    </HStack>
                                </HStack>

                                <Button
                                    title="Marcar como realizado"
                                    isLoading={sendingRegister}
                                    onPress={handleExerciseHistoryRegister}
                                />
                            </Box>
                        </VStack>
                    </ScrollView>
                </>
            )}
        </VStack>
    );
}
