import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Section } from '@shared/interfaces/section';
import { sanityClient } from '@shared/sanity';
import settingsOrderedQuery from '@shared/queries/settings-ordered.query';
import SearchProvider from '@popup/providers/SearchProvider';
import SettingsProvider from '@popup/providers/SettingsProvider';
import CustomSettingsProvider from '@popup/providers/CustomSettingsProvider';
import Header from '@popup/components/Header';
import Settings from '@popup/components/Settings';
import '@popup/styles/globals.scss';

export default function App() {
  const [settings, setSettings] = useState<Section[]>([]);

  useEffect((): void => {
    /**
     * TODO: Reimplement predefined settings fetched from Sanity per origin
     *
     * sanityClient
     *   .fetch(settingsOrderedQuery)
     *   .then((response: { settings: Section[] }): void => {
     *     setSettings(response.settings);
     *   });
     */
  }, []);

  return (
    <SearchProvider>
      <SettingsProvider>
        <CustomSettingsProvider>
          <Header />
          <Settings settings={settings} />
        </CustomSettingsProvider>
      </SettingsProvider>
    </SearchProvider>
  );
}
