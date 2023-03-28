// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { Combobox } from '@headlessui/react';
import clsx from 'clsx';
import { useState, useCallback, useEffect } from 'react';

import ModuleView from './ModuleView';
import { ModuleFunctionsInteraction } from './module-functions-interaction';

import { ReactComponent as SearchIcon } from '~/assets/SVGIcons/24px/Search.svg';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '~/ui/Tabs';
import { ListItem, VerticalList } from '~/ui/VerticalList';
import { useSearchParamsMerged } from '~/ui/utils/LinkWithQuery';

type ModuleType = [moduleName: string, code: string];

interface Props {
    id?: string;
    modules: ModuleType[];
}

interface ModuleViewWrapperProps {
    id?: string;
    selectedModuleName: string;
    modules: ModuleType[];
}

function ModuleViewWrapper({
    id,
    selectedModuleName,
    modules,
}: ModuleViewWrapperProps) {
    const selectedModuleData = modules.find(
        ([name]) => name === selectedModuleName
    );

    if (!selectedModuleData) {
        return null;
    }

    const [name, code] = selectedModuleData;

    return <ModuleView id={id} name={name} code={code} />;
}

function PkgModuleViewWrapper({ id, modules }: Props) {
    const modulenames = modules.map(([name]) => name);
    const [searchParams, setSearchParams] = useSearchParamsMerged();
    const [query, setQuery] = useState('');

    // Extract module in URL or default to first module in list
    const selectedModule =
        searchParams.get('module') &&
        modulenames.includes(searchParams.get('module')!)
            ? searchParams.get('module')!
            : modulenames[0];

    // If module in URL exists but is not in module list, then delete module from URL
    useEffect(() => {
        if (
            searchParams.has('module') &&
            !modulenames.includes(searchParams.get('module')!)
        ) {
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams, modulenames]);

    const filteredModules =
        query === ''
            ? modulenames
            : modules
                  .filter(([name]) =>
                      name.toLowerCase().includes(query.toLowerCase())
                  )
                  .map(([name]) => name);

    const submitSearch = useCallback(() => {
        if (filteredModules.length === 1) {
            setSearchParams({
                module: filteredModules[0],
            });
        }
    }, [filteredModules, setSearchParams]);

    const onChangeModule = (newModule: string) => {
        setSearchParams({
            module: newModule,
        });
    };

    return (
        <div className="border-gray-45 flex flex-col gap-5 border-y md:flex-row md:flex-nowrap">
            <div className="w-full md:w-1/5">
                <Combobox value={selectedModule} onChange={onChangeModule}>
                    <div className="placeholder-gray-65 mt-2.5 flex w-full justify-between rounded-md border border-gray-50 py-1 pl-3 shadow-sm">
                        <Combobox.Input
                            onChange={(event) => setQuery(event.target.value)}
                            displayValue={() => query}
                            placeholder="Search"
                            className="w-full border-none"
                        />
                        <button
                            onClick={submitSearch}
                            className="border-none bg-inherit pr-2"
                            type="submit"
                        >
                            <SearchIcon className="h-4.5 w-4.5 fill-steel cursor-pointer align-middle" />
                        </button>
                    </div>
                    <Combobox.Options className="max-h-verticalListLong shadow-moduleOption absolute left-0 z-10 flex h-fit w-full flex-col gap-1 overflow-auto rounded-md bg-white px-2 pb-5 pt-3 md:left-auto md:w-1/6">
                        {filteredModules.length > 0 ? (
                            <div className="text-caption text-gray-75 ml-1.5 pb-2 font-semibold uppercase">
                                {filteredModules.length}
                                {filteredModules.length === 1
                                    ? ' Result'
                                    : ' Results'}
                            </div>
                        ) : (
                            <div className="text-body text-gray-70 px-3.5 pt-2 text-center italic">
                                No results
                            </div>
                        )}
                        {filteredModules.map((name) => (
                            <Combobox.Option
                                key={name}
                                value={name}
                                className="list-none md:min-w-fit"
                            >
                                {({ active }) => (
                                    <button
                                        type="button"
                                        className={clsx(
                                            'text-body mt-0.5 block w-full cursor-pointer rounded-md border px-1.5 py-2 text-left',
                                            active
                                                ? 'bg-sui/10 text-gray-80 border-transparent'
                                                : 'text-gray-80 border-transparent bg-white font-medium'
                                        )}
                                    >
                                        {name}
                                    </button>
                                )}
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Combobox>
                <div className="h-verticalListShort md:h-verticalListLong overflow-auto pt-3">
                    <VerticalList>
                        {modulenames.map((name) => (
                            <div
                                key={name}
                                className="mx-0.5 mt-0.5 md:min-w-fit"
                            >
                                <ListItem
                                    active={selectedModule === name}
                                    onClick={() => onChangeModule(name)}
                                >
                                    {name}
                                </ListItem>
                            </div>
                        ))}
                    </VerticalList>
                </div>
            </div>
            <div className="border-gray-45 grow overflow-auto pt-5 md:w-2/5 md:border-l md:pl-7">
                <TabGroup size="md">
                    <TabList>
                        <Tab>Bytecode</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="h-verticalListLong overflow-auto">
                                <ModuleViewWrapper
                                    id={id}
                                    modules={modules}
                                    selectedModuleName={selectedModule}
                                />
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
            <div className="border-gray-45 grow overflow-auto pt-5 md:w-3/5 md:border-l md:pl-7">
                <TabGroup size="md">
                    <TabList>
                        <Tab>Execute</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <div className="h-verticalListLong overflow-auto">
                                {id && selectedModule ? (
                                    <ModuleFunctionsInteraction
                                        // force recreating everything when we change modules
                                        key={`${id}-${selectedModule}`}
                                        packageId={id}
                                        moduleName={selectedModule}
                                    />
                                ) : null}
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
}
export default PkgModuleViewWrapper;
