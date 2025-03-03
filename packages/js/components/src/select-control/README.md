# SelectControl

A search box which filters options while typing,
allowing a user to select from an option from a filtered list.

## Usage

```jsx
const options = [
	{
		key: 'apple',
		label: 'Apple',
		value: { id: 'apple' },
	},
	{
		key: 'apricot',
		label: 'Apricot',
		value: { id: 'apricot' },
	},
];

<SelectControl
	label="Single value"
	onChange={ ( selected ) => setState( { singleSelected: selected } ) }
	options={ options }
	placeholder="Start typing to filter options..."
	selected={ singleSelected }
/>;
```

### Props

| Name                     | Type         | Default    | Description                                                                                                                                                     |
| ------------------------ | ------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `className`              | string       | `null`     | Class name applied to parent div                                                                                                                                |
| `excludeSelectedOptions` | boolean      | `true`     | Exclude already selected options from the options list                                                                                                          |
| `onFilter`               | function     | `identity` | Add or remove items to the list of options after filtering, passed the array of filtered options and should return an array of options.                         |
| `getSearchExpression`    | function     | `identity` | Function to add regex expression to the filter the results, passed the search query                                                                             |
| `help`                   | string\|node | `null`     | Help text to be appended beneath the input                                                                                                                      |
| `inlineTags`             | boolean      | `false`    | Render tags inside input, otherwise render below input                                                                                                          |
| `label`                  | string       | `null`     | A label to use for the main input                                                                                                                               |
| `onChange`               | function     | `noop`     | Function called when selected results change, passed result list                                                                                                |
| `onSearch`               | function     | `noop`     | Function to run after the search query is updated, passed the search query                                                                                      |
| `options`                | array        | `null`     | (required) An array of objects for the options list. The option along with its key, label and value will be returned in the onChange event                      |
| `placeholder`            | string       | `null`     | A placeholder for the search input                                                                                                                              |
| `selected`               | array        | `[]`       | An array of objects describing selected values. If the label of the selected value is omitted, the Tag of that value will not be rendered inside the search box |
| `maxResults`             | number       | `0`        | A limit for the number of results shown in the options menu. Set to 0 for no limit                                                                              |
| `multiple`               | boolean      | `false`    | Allow multiple option selections                                                                                                                                |
| `showClearButton`        | boolean      | `false`    | Render a 'Clear' button next to the input box to remove its contents                                                                                            |
| `hideBeforeSearch`       | boolean      | `false`    | Only show list options after typing a search query                                                                                                              |
| `staticList`             | boolean      | `false`    | Render results list positioned statically instead of absolutely                                                                                                 |

### onChange value

The onChange value defaults to an array of the selected option(s), but will also reflect what has been passed in the `selected` prop.
If the `selected` prop has the value set as a `string`, the `onChange` method will also be called with a string value - the `key` of the selected option (if multiple is `false`).

Only string or array are the supported types here.

## Virtualized Lists for Large Datasets

When dealing with a large number of options (thousands), you can enable virtualization for better performance. This feature uses the `react-window` library to render only the items that are visible in the viewport, significantly improving performance.

```jsx
<SelectControl
    label="Select from large dataset"
    onChange={ handleSelect }
    options={ largeDataset } // Array with thousands of options
    placeholder="Start typing to search..."
    isSearchable={ true }
    virtualScroll={ true } // Enable virtualization
    virtualItemHeight={ 35 } // Height of each option in pixels
    virtualListHeight={ 300 } // Maximum height of the dropdown
/>
```

### Virtualization Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `virtualScroll` | boolean | `false` | Enable virtual scrolling for large lists |
| `virtualItemHeight` | number | `35` | Height in pixels for each virtual item |
| `virtualListHeight` | number | `300` | Maximum height in pixels for the virtualized list |

## Props

Name | Type | Default | Description
--- | --- | --- | ---
`autofill` | String | `undefined` | A name to use for the autofill field, should be unique for the current page.
`className` | String | `undefined` | Class name applied to parent div.
`controlClassName` | String | `undefined` | Class name applied to select input.
`disabled` | Boolean | `false` | Whether the control should be disabled.
`excludeSelectedOptions` | Boolean | `true` | Determines if selected options should be omitted from the options list.
`onFilter` | Function | `identity` | Add or remove items to the list of options after filtering, passed the array of filtered options and should return an array of options.
`getSearchExpression` | Function | `identity` | Function to add regex expression based on the query.
`help` | ReactNode | `undefined` | Help text to be appended beneath the input.
`inlineTags` | Boolean | `false` | Render tags inside input, otherwise render below input.
`instanceId` | Number | `undefined` | A unique identifier for the select control instance. The instanceId is shared between selectControls, meaning that the same instance will appear and work on different select controls.
`isSearchable` | Boolean | `false` | Render tags inside input, otherwise render below input.
`label` | String | `undefined` | A label to use for the main input.
`maxResults` | Number | `0` (no limit) | Maximum number of results shown.
`multiple` | Boolean | `false` | Allow multiple option selections.
`onChange` | Function | `noop` | Function called when selected results change, result is an array of objects with names.
`onSearch` | Function | `Promise.resolve(options)` (doesn't do any searching) | Function to execute when the search field is changed, returns a promise with updated options.
`options` | Array< Object > | `undefined` | (required) An array of objects for the options list. The option along with its key, label and value will be returned in the onChange event.
`placeholder` | String | `undefined` | A placeholder for the search input.
`searchDebounceTime` | Number | `0` (no debounce) | Debounce time in milliseconds for the search function.
`searchInputType` | String | `'search'` | Set the input type for the search control. Accepts any HTML 5 input type.
`selected` | Array< Object >, String, Number | `undefined` | An array of objects describing selected values. If the label of the selected value is omitted, the Tag of that value will not be rendered inside the search box.
`showAllOnFocus` | Boolean | `false` | Whether to show the menu when focusing on the select box / search input.
`showClearButton` | Boolean | `false` | Show a 'Clear' button next to the input box to remove its contents. When the 'Clear' button is clicked, the list of options will no longer be filtered if `hideBeforeSearch` is enabled.
`hideBeforeSearch` | Boolean | `false` | Hide the select options menu before typing a search query.
`staticList` | Boolean | `false` | Render our menu list of options using a static position.
`autoComplete` | String | `'off'` | HTML field for the input's attribute. Must be a valid HTML autocomplete attribute value such as 'off'.
`ariaLabel` | String | `undefined` | aria-label for search input.
