// YourComponent.js

const FrameBase = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, orange, #aa3855, purple)',
            justifyContent: 'center'
        }}>
            <div style={{
                display: 'flex',
                position: 'absolute',
                bottom: 10,
                left: 15,
                alignItems: 'center',
            }}>
                <img src={`${process.env['HOST']}/Full_logo.png`} style={{ width: 120, height: 40 }}/>
            </div>
                {/* Render the children components or content */}
                {children}
        </div>
    );
}

export default FrameBase;