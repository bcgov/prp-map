# Parks and Recreation Program (PRP) Map

## Development

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Open your browser and navigate to `http://localhost:3000` to view the example application

### Creating new components

- Create a new folder in the `src/components` directory
- Add a new file for your component, e.g., `MyComponent.tsx`
- Export the component as a default export
- Add the export to the `src/index.ts` file to make it available as part of the library
- Add it to the example application by importing and using it in `src/App.tsx`
- Run `npm run dev` to see your changes in the example application

## Publishing

1. Ensure you are a maintainer in the `@bcgov` NPM organization
2. Update the version in `package.json`
3. Run `npm login` to log in to your NPM account
4. Run `npm run publish` which will:
   - Build the library
   - Publish it to NPM
