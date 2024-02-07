// YourComponent.js
import React from 'react';

const FrameBase = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            textAlign: 'center',
            width: '100%',
            height: '100%',
            lineHeight: 1.2,
            background: 'linear-gradient(to top right, orange, purple, orange)',
            justifyContent: 'center'
        }}>
            <div style={{
                display: 'flex',
                position: 'absolute',
                top: 40,
                left: 10,
                alignItems: 'center',
            }}>
                <h3 style={{ color: 'white' }}>Bookies</h3>
                <img src={`${process.env['HOST']}/logo_transparent.png`} style={{ width: 40, height: 40 }} alt="Logo" />
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