import { HStack, useRadioGroup } from "@chakra-ui/react"
import RadioCard from "./RadioCard"

function PickBet({defaultPick=null, options=[], pickHandler=(value) => {}}) {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'pick',
        defaultValue: defaultPick !== null ? defaultPick.toString() : null,
        onChange: pickHandler
      })

    const group = getRootProps()

    return (
        <HStack {...group} w="100%" spacing={2}>
            {options.map((value, index) => {
                const radio = getRadioProps({ value: index.toString() })
                return (
                <RadioCard key={index} {...radio}>
                    {value}
                </RadioCard>
                )
            })}
        </HStack>
    )
}

export default PickBet;