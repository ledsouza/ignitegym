import { useCallback, useState } from "react";
import { SectionList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { Heading, Text, useToast, VStack } from "@gluestack-ui/themed";

import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";

import { api } from "@services/api";

import { handleAppError } from "@utils/HandleAppError";
import { ScreenHeader } from "@components/ScreenHeader";
import { HistoryCard } from "@components/HistoryCard";
import Loading from "@components/Loading";

export function History() {
    const [isLoading, setIsLoading] = useState(true);
    const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

    const toast = useToast();

    async function fetchHistory() {
        try {
            setIsLoading(true);

            const response = await api.get("/history");
            setExercises(response.data);
        } catch (error) {
            handleAppError(
                error,
                toast,
                "Não foi possível carregar os detalhes do exercício."
            );
        } finally {
            setIsLoading(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [])
    );

    return (
        <VStack flex={1}>
            <ScreenHeader title="Histórico" />

            {isLoading ? (
                <Loading />
            ) : (
                <SectionList
                    sections={exercises}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <HistoryCard data={item} />}
                    renderSectionHeader={({ section }) => (
                        <Heading
                            color="$gray200"
                            fontSize="$md"
                            mt="$10"
                            mb="$3"
                        >
                            {section.title}
                        </Heading>
                    )}
                    style={{ paddingHorizontal: 32 }}
                    contentContainerStyle={
                        exercises.length === 0 && {
                            flex: 1,
                            justifyContent: "center",
                        }
                    }
                    ListEmptyComponent={() => (
                        <Text color="$gray200" textAlign="center">
                            Não há exercícios registrados ainda. {"\n"}
                            Vamos fazer execícios hoje?
                        </Text>
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </VStack>
    );
}
