import * as React from 'react';
import SvgIcon from '@mui/material/SvgIcon';

export function SitemarkIcon() {
    return (
        <SvgIcon sx={{ height: 60, width: 60, mb: 2 }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    fill="currentColor"
                    opacity="0.3"
                />
                <path
                    d="M2 17L12 22L22 17V12L12 17L2 12V17Z"
                    fill="currentColor"
                />
                <path
                    d="M2 12L12 17L22 12V7L12 12L2 7V12Z"
                    fill="currentColor"
                    opacity="0.7"
                />
            </svg>
        </SvgIcon>
    );
}
