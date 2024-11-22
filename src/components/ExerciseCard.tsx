import {
    Heading,
    HStack,
    Icon,
    Image,
    Text,
    VStack,
} from "@gluestack-ui/themed";
import { ChevronRight } from "lucide-react-native";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";

type Props = TouchableOpacityProps;

export function ExerciseCard({ ...props }: Props) {
    return (
        <TouchableOpacity {...props}>
            <HStack
                bg="$gray500"
                alignItems="center"
                p="$2"
                pr="$4"
                rounded="$md"
            >
                <Image
                    source={{
                        uri: "https://www.hipertrofia.org/blog/wp-content/uploads/2023/04/dumbbell-biceps-curl-reverse.gif",
                    }}
                    alt="Imagem do exercício"
                    w="$16"
                    h="$16"
                    rounded="$md"
                    mr="$4"
                    resizeMode="cover"
                />

                <VStack flex={1}>
                    <Heading
                        fontSize="$lg"
                        color="$white"
                        fontFamily="$heading"
                    >
                        Puxada frontal
                    </Heading>
                    <Text
                        fontSize="$sm"
                        color="$gray200"
                        mt="$1"
                        numberOfLines={2}
                    >
                        3 séries x 12 repetições
                    </Text>
                </VStack>

                <Icon as={ChevronRight} color="$gray300" />
            </HStack>
        </TouchableOpacity>
    );
}
