import { HStack, useRadioGroup } from "@chakra-ui/react"
import RadioCard from "./RadioCard"

function PickBet({pick=null, options=[]}) {
    const { getRootProps, getRadioProps } = useRadioGroup({
        name: 'pick',
        defaultValue: pick !== null ? pick.toString() : null,
        onChange: (_value) => {}
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