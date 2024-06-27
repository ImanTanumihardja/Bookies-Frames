import { Box, useRadio } from "@chakra-ui/react"

function RadioCard(props) {
    const { getInputProps, getRadioProps } = useRadio(props)

    const input = getInputProps()
    const checkbox = getRadioProps()

    return (
        <Box as='label' w='50%' className="font-bold text-inter">
        <input {...input} />
        <Box
            {...checkbox}
            cursor='pointer'
            borderRadius='md'
            bg="white" 
            color="black" 
            display='flex'
            alignItems='center'
            justifyContent='center'
            textAlign='center'
            height={12}
            _checked={{
                bg: 'gray.600',
                color: 'black',
                boxShadow:'lg'
            }}
        >
            {props.children}
        </Box>
        </Box>
    )
}

export default RadioCard;