import { HStack, useRadioGroup } from "@chakra-ui/react"
import RadioCard from "./RadioCard"

function PickBet({options = []}) {

    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'pick',
        defaultValue: null,
        onChange: console.log,
      })

    const group = getRootProps()

    return (
        <HStack {...group} w="100%" spacing={2}>
            {options.map((value) => {
                const radio = getRadioProps({ value })
                return (
                <RadioCard key={value} {...radio}>
                    {value}
                </RadioCard>
                )
            })}
        </HStack>
    )
}

export default PickBet;