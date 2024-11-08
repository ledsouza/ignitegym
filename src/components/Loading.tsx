import { Center, Spinner } from "@gluestack-ui/themed";

const Loading = () => {
    return (
        <Center flex={1} bg="$gray700">
            <Spinner color="$green500" size="large" />
        </Center>
    );
};

export default Loading;
