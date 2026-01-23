import { createContext, useContext, useState, ReactNode } from 'react';

interface PageTitleContextType {
    menuTitle: string;
    setMenuTitle: (title: string) => void;
    detailTitle: string;
    setDetailTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export function PageTitleProvider({ children }: { children: ReactNode }) {
    const [menuTitle, setMenuTitle] = useState('Dashboard');
    const [detailTitle, setDetailTitle] = useState('');

    return (
        <PageTitleContext.Provider value={{ menuTitle, setMenuTitle, detailTitle, setDetailTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
}

export function usePageTitle() {
    const context = useContext(PageTitleContext);
    if (context === undefined) {
        throw new Error('usePageTitle must be used within a PageTitleProvider');
    }
    return context;
}
