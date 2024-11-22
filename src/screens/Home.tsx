import { useState } from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { VStack, HStack, Text, Heading } from "@gluestack-ui/themed";

import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { ExerciseCard } from "@components/ExerciseCard";

export function Home() {
    const navigation = useNavigation<AppNavigatorRoutesProps>();

    const [exercises, setExercises] = useState([
        "Puxada frontal",
        "Remada curvada",
        "Remada unilateral",
        "Levantamento terra",
        "Levantamento terra2",
        "Levantamento terra3",
        "Levantamento terra4",
        "Levantamento terra5",
        "Levantamento terra6",
        "Levantamento terra7",
    ]);
    const [groups, setGroups] = useState([
        "Costas",
        "Bíceps",
        "Tríceps",
        "Ombro",
    ]);
    const [groupSelected, setGroupSelected] = useState("Costas");

    function handleOpenExerciseDetails() {
        navigation.navigate("exercise");
    }

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
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <ExerciseCard onPress={handleOpenExerciseDetails} />
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20, gap: 16 }}
                />
            </VStack>
        </VStack>
    );
}
