

const FrameBase = ({ children, logoW=50, logoH=50 }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, orange, #aa3855, purple)',
            justifyContent: 'center'
        }}>
            <img src={`${process.env['NEXT_PUBLIC_HOST']}/icon_transparent.png`} style={{ width: logoW, height: logoH, position: 'absolute', bottom:20, left:20}}/>
            {/* Render the children components or content */}
            {children}
        </div>
    );
}

export default FrameBase;