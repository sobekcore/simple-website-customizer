import { SimpleWebsiteCustomizer } from '@content/interfaces/simple-website-customizer';

declare global {
  interface Window {
    simpleWebsiteCustomizer: SimpleWebsiteCustomizer;
  }
}
