import * as React from "react";

export interface ITabPanelHandledProps {
    /**
     * The slot identifying this component to the TabPanel component as a tab-panel
     * the string passed must be "tab-panel"
     */
    slot: string;

    /**
     * The tab-panel content
     */
    children?: React.ReactNode | React.ReactNode[];
}

export interface ITabPanelUnhandledProps extends React.AllHTMLAttributes<HTMLElement> {}
export type TabPanelProps = ITabPanelHandledProps & ITabPanelUnhandledProps;
