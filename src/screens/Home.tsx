import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { VStack, HStack, Text, Heading, useToast } from "@gluestack-ui/themed";

import { ExerciseDTO } from "@dtos/ExerciseDTO";

import { api } from "@services/api";
import { AppError } from "@utils/AppError";

import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { ExerciseCard } from "@components/ExerciseCard";
import { ToastMessage } from "@components/ToastMessage";
import Loading from "@components/Loading";

export function Home() {
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    const toast = useToast();

    const [isLoading, setIsLoading] = useState(true);

    const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
    const [groups, setGroups] = useState<string[]>([]);
    const [groupSelected, setGroupSelected] = useState("");

    function handleOpenExerciseDetails(exerciseId: string) {
        navigation.navigate("exercise", { exerciseId });
    }

    async function fetchGroups() {
        try {
            const response = await api.get("/groups");
            setGroups(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError
                ? error.message
                : "Não foi possível carregar os grupos musculares.";

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

    async function fetchExercisesByGroup() {
        try {
            setIsLoading(true);
            const response = await api.get(
                `/exercises/bygroup/${groupSelected}`
            );
            setExercises(response.data);
        } catch (error) {
            const isAppError = error instanceof AppError;
            const title = isAppError
                ? error.message
                : "Não foi possível carregar os exercícios";

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

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (groups.length > 0) {
            setGroupSelected(groups[0]);
        }
    }, [groups]);

    useFocusEffect(
        useCallback(() => {
            fetchExercisesByGroup();
        }, [groupSelected])
    );

    return (
        <VStack flex={1}>
            <HomeHeader />

            <FlatList
                data={groups}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                    <Group
                        name={item}
                        isActive={
                            groupSelected.toLowerCase() === item.toLowerCase()
                        }
                        onPress={() => setGroupSelected(item)}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16, paddingHorizontal: 32 }}
                style={{ marginVertical: 40, maxHeight: 44, minHeight: 44 }}
            />

            {isLoading ? (
                <Loading />
            ) : (
                <VStack px="$8" flex={1}>
                    <HStack
                        justifyContent="space-between"
                        alignItems="center"
                        mb="$5"
                    >
                        <Heading color="$gray200" fontSize="$md">
                            Exercícios
                        </Heading>

                        <Text color="$gray200" fontSize="$sm">
                            {exercises.length}
                        </Text>
                    </HStack>

                    <FlatList
                        data={exercises}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <ExerciseCard
                                data={item}
                                onPress={() =>
                                    handleOpenExerciseDetails(item.id)
                                }
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20, gap: 16 }}
                    />
                </VStack>
            )}
        </VStack>
    );
}
