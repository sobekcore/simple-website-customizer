import { defineConfig } from 'sanity';
import { ListBuilder, StructureBuilder, StructureResolverContext, deskTool } from 'sanity/desk';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { schemaTypes } from '@/schemas';
import { SANITY_PROJECT_ID, SANITY_DATASET } from '../shared/sanity';

export default defineConfig({
  name: 'default',
  title: 'Simple Website Customizer',
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  plugins: [
    deskTool({
      structure: (structure: StructureBuilder, context: StructureResolverContext): ListBuilder => {
        return structure.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({
              S: structure,
              context: context,
              title: 'Settings',
              type: 'section',
            }),
            structure.divider(),
            ...structure.documentTypeListItems(),
          ]);
      },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
