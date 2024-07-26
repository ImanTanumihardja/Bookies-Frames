const FrameBase = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, #68b876, #457e8b, #0000b4)',
            justifyContent: 'center'
        }}>
            <img src={`${process.env['NEXT_PUBLIC_HOST']}/icon_transparent.png`} style={{ width: 50, height: 50, position: 'absolute', bottom:10, left:10}}/>
            {/* Render the children components or content */}
            {children}
        </div>
    );
}

export default FrameBase;