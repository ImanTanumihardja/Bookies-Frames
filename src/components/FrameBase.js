// YourComponent.js

const FrameBase = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, orange, purple)',
            justifyContent: 'center'
        }}>
            <div style={{
                display: 'flex',
                position: 'absolute',
                top: 47,
                left: 15,
                alignItems: 'center',
            }}>
                <img src={`${process.env['HOST']}/Full_logo.png`} style={{ width: 120, height: 40 }}/>
            </div>
            <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '5px solid white',
                    padding: 50,
                    height: '60%',
                    width: '90%',
                    top:20
            }}>
                {/* Render the children components or content */}
                {children}
            </div>
        </div>
    );
}

export default FrameBase;