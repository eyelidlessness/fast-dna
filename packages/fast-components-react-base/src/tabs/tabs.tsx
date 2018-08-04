import * as React from "react";
import { get } from "lodash-es";
import { KeyCodes } from "@microsoft/fast-web-utilities";
import { IManagedClasses, ITabsClassNameContract } from "@microsoft/fast-components-class-name-contracts-base";
import Foundation, { HandledProps } from "../foundation";
import { ITabsHandledProps, ITabsManagedClasses, ITabsUnhandledProps, TabsProps } from "./tabs.props";
import Tab from "./tab";
import TabItem from "./tab-item";
import TabPanel from "./tab-panel";

export enum TabSlot {
    tab = "tab",
    tabItem = "tab-item",
    tabPanel = "tab-panel"
}

export interface ITabsState {
    activeId: string;
}

class Tabs extends Foundation<ITabsHandledProps & ITabsManagedClasses, ITabsUnhandledProps, ITabsState> {

    /**
     * React life-cycle method
     */
    public static getDerivedStateFromProps(nextProps: TabsProps, prevState: ITabsState): null | ITabsState {
        if (nextProps.activeId && nextProps.activeId !== prevState.activeId) {
            return {
                activeId: nextProps.activeId
            };
        }

        return null;
    }

    protected handledProps: HandledProps<ITabsHandledProps & IManagedClasses<ITabsClassNameContract>> = {
        children: void 0,
        managedClasses: void 0,
        activeId: void 0
    };

    /**
     * React ref for the tab list
     */
    private tabListRef: React.RefObject<HTMLDivElement>;

    constructor(props: TabsProps) {
        super(props);

        const tabItems: JSX.Element[] = this.getChildBySlot(this.props.children, TabSlot.tabItem);
        this.tabListRef = React.createRef();

        this.state = {
            activeId: this.props.activeId
                ? this.props.activeId
                : tabItems.length > 0
                ? tabItems[0].props.id
                : void(0)
        };
    }

    /**
     * Renders the component
     */
    public render(): JSX.Element {
        const tabElements: JSX.Element[] = this.renderTabElements();

        if (tabElements.length > 0) {
            return (
                <div
                    {...this.unhandledProps()}
                    className={this.generateClassNames()}
                >
                    <div role="tablist" ref={this.tabListRef} className={this.props.managedClasses.tab_list}>
                        {tabElements}
                    </div>
                    {this.renderTabPanels()}
                </div>
            );
        }

        return null;
    }

    /**
     * Generates class names based on props
     */
    protected generateClassNames(): string {
        return super.generateClassNames(get(this.props, "managedClasses.tabs"));
    }

    /**
     * Renders the tab elements
     */
    private renderTabElements(): JSX.Element[] {
        const tabElements: JSX.Element[] = [];

        this.getChildBySlot(this.props.children, TabSlot.tabItem).forEach((tabItem: JSX.Element, index: number): void => {
            const id: string = get(tabItem, "props.id") ? tabItem.props.id : `tab${index}`;

            tabElements.push(
                <button
                    key={id}
                    role="tab"
                    className={this.generateTabClassNames(id)}
                    aria-controls={id}
                    onClick={this.handleClick}
                    onKeyDown={this.handleKeyDown}
                    tabIndex={this.state.activeId !== id ? -1 : 0}
                >
                    {this.getChildBySlot(tabItem.props.children, TabSlot.tab)[0]}
                </button>
            );
        });

        return tabElements;
    }

    /**
     * Renders the tab panels
     */
    private renderTabPanels(): JSX.Element[] {
        const tabPanels: JSX.Element[] = [];

        this.getChildBySlot(this.props.children, TabSlot.tabItem).forEach((tabItem: JSX.Element, index: number): void => {
            const id: string = get(tabItem, "props.id") ? tabItem.props.id : `tab${index}`;

            tabPanels.push(
                <div
                    key={id}
                    id={id}
                    className={this.props.managedClasses.tab_panel}
                    role="tabpanel"
                    aria-labelledby={id}
                    aria-hidden={this.state.activeId !== id ? true : false}
                >
                    {this.getChildBySlot(tabItem.props.children, TabSlot.tabPanel)[0]}
                </div>
            );
        });

        return tabPanels;
    }

    /**
     * Generate class names for tab elements
     */
    private generateTabClassNames(id: string): string {
        return this.state.activeId !== id
            ? this.props.managedClasses.tab
            : `${this.props.managedClasses.tab} ${this.props.managedClasses.tab__active}`;
    }

    /**
     * Handles the click event on the tab element
     */
    private handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
        if (!this.props.activeId) {
            this.setState({
                activeId: e.currentTarget.getAttribute("aria-controls")
            });
        } else if (typeof this.props.onUpdateTab === "function") {
            this.props.onUpdateTab(e.currentTarget.getAttribute("aria-controls"));
        }
    }

    /**
     * Handles the keydown event on the tab element
     */
    private handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
        switch (e.keyCode) {
            case KeyCodes.arrowLeft:
            case KeyCodes.arrowUp:
                this.activatePrevious();
                break;
            case KeyCodes.arrowRight:
            case KeyCodes.arrowDown:
                this.activateNext();
                break;
            case KeyCodes.home:
                this.activateFirst();
                break;
            case KeyCodes.end:
                this.activateLast();
                break;
        }
    }

    /**
     * Activates the previous tab item
     */
    private activatePrevious(): void {
        const items: JSX.Element[] = this.getChildBySlot(this.props.children, TabSlot.tabItem);
        const currentItemIndex: number = items.findIndex(this.getCurrentIndexById);
        const previousItemIndex: number = currentItemIndex > 0 ? currentItemIndex - 1 : items.length - 1;
        const previousItemId: string = items[previousItemIndex].props.id;

        if (!this.props.activeId) {
            this.setState({
                activeId: previousItemId
            });

            (Array.from(this.tabListRef.current.children)[previousItemIndex] as HTMLButtonElement).focus();
        } else if (typeof this.props.onUpdateTab === "function") {
            this.props.onUpdateTab(previousItemId);
        }
    }

    /**
     * Activates the next tab item
     */
    private activateNext(): void {
        const items: JSX.Element[] = this.getChildBySlot(this.props.children, TabSlot.tabItem);
        const currentItemIndex: number = items.findIndex(this.getCurrentIndexById);
        const nextItemIndex: number = currentItemIndex < items.length - 1 ? currentItemIndex + 1 : 0;
        const nextItemId: string = items[nextItemIndex].props.id;

        if (!this.props.activeId) {
            this.setState({
                activeId: nextItemId
            });

            (Array.from(this.tabListRef.current.children)[nextItemIndex] as HTMLButtonElement).focus();
        } else if (typeof this.props.onUpdateTab === "function") {
            this.props.onUpdateTab(nextItemId);
        }
    }

    /**
     * Activates the first tab item
     */
    private activateFirst(): void {
        const items: JSX.Element[] = this.getChildBySlot(this.props.children, TabSlot.tabItem);
        const activeId: string = items[0].props.id;

        if (!this.props.activeId) {
            this.setState({
                activeId
            });

            (Array.from(this.tabListRef.current.children)[0] as HTMLButtonElement).focus();
        } else if (typeof this.props.onUpdateTab === "function") {
            this.props.onUpdateTab(activeId);
        }
    }

    /**
     * Activates the last tab item
     */
    private activateLast(): void {
        const items: JSX.Element[] = this.getChildBySlot(this.props.children, TabSlot.tabItem);
        const lastItemIndex: number = items.length - 1;
        const activeId: string = items[lastItemIndex].props.id;

        if (!this.props.activeId) {
            this.setState({
                activeId
            });

            (Array.from(this.tabListRef.current.children)[lastItemIndex] as HTMLButtonElement).focus();
        } else if (typeof this.props.onUpdateTab === "function") {
            this.props.onUpdateTab(activeId);
        }
    }

    /**
     * Gets the current index by tab item ID
     */
    private getCurrentIndexById = (item: JSX.Element): boolean => {
        return item.props.id === this.state.activeId;
    }

    /**
     * Gets the child by the slot property
     */
    private getChildBySlot(children: React.ReactNode, slot: TabSlot): JSX.Element[] {
        const childBySlot: JSX.Element[] = [];

        React.Children.forEach(children, (child: JSX.Element): void => {
            if (child.props && child.props.slot === slot) {
                if (slot === TabSlot.tabItem) {
                    if (
                        !!this.getChildBySlot(child.props.children, TabSlot.tab)[0]
                        && !!this.getChildBySlot(child.props.children, TabSlot.tabPanel)[0]
                    ) {
                        childBySlot.push(child);
                    }
                } else {
                    childBySlot.push(child);
                }
            }
        });

        return childBySlot;
    }
}

export default Tabs;
export * from "./tabs.props";
export {
    Tab,
    TabItem,
    TabPanel
};
