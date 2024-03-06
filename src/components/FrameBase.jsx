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
            <img src={`${process.env['HOST']}/icon_transparent.png`} style={{ width: 70, height: 70, position: 'absolute', bottom:5, left:5}}/>
            {/* Render the children components or content */}
            {children}
        </div>
    );
}

export default FrameBase;