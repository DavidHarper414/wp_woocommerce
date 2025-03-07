/**
 * External dependencies
 */
import { DataViews, View } from '@wordpress/dataviews/wp';
import {
	useEntityRecords,
	Post,
	store as coreStore,
} from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useState, useMemo } from '@wordpress/element';
import { QueryArgs } from '@wordpress/url/build-types/get-query-args';
import { edit } from '@wordpress/icons';
import { Icon } from '@wordpress/components';

export const ListView = () => {
    const [ view, setView ] = useState< View >( {
		type: 'table',
		search: '',
		fields: [ 'author', 'status', 'date' ],
		filters: [],
		page: 1,
		perPage: 10,
		sort: {
			field: 'date',
			direction: 'desc',
		},
		titleField: 'title',
		showTitle: true,
		mediaField: 'featured_media',
	} );

    const queryArgs = useMemo( () => {
		const filters: QueryArgs = {};
		view.filters.forEach( ( filter ) => {
			if ( filter.field === 'status' && filter.operator === 'isAny' ) {
				filters.status = filter.value;
			}
			if ( filter.field === 'author' && filter.operator === 'is' ) {
				filters.author = filter.value;
			}
		} );
		return {
			status: 'any',
			per_page: view.perPage,
			page: view.page,
			_embed: 'author',
			order: view.sort?.direction,
			orderby: view.sort?.field,
			search: view.search,
			...filters,
		};
	}, [ view ] );

    const { records } = useEntityRecords(
		'postType',
		'woo_email',
		queryArgs
	);
	const { totalRecords } = useSelect(
		( select ) => {
			return {
				totalRecords: select( coreStore ).getEntityRecordsTotalItems(
					'postType',
					'woo_email',
				 	queryArgs
				) ?? 0,
			};
		},
		[ queryArgs ]
	);

    const fields = [
		{
			id: 'title',
			label: 'Title',
			enableHiding: false,
			render: ( item ) => {
				return item.item.title.raw;
			},
			Edit: 'text',
		},
		{
			id: 'id',
			label: 'Id',
			enableHiding: false,
		},
		{
			id: 'author',
			label: 'Author',
			enableHiding: true,
			render: ( item ) => {
				const author = item.item._embedded?.author?.[ 0 ] || null;
				const avatarUrl = author?.avatar_urls?.[ 24 ] || null;
				if ( ! author ) {
					return null;
				}
				return (
					<>
						{ avatarUrl && (
							<>
								<img
									src={ avatarUrl }
									alt={ author.name }
									style={ {
										width: '24px',
										height: '24px',
										borderRadius: '14px',
										border: '1px solid #ddd',
									} }
								/>
								&nbsp;
							</>
						) }
						{ author.name }
					</>
				);
			},
			filterBy: {
				operators: [ 'is' ],
			},
			elements: [
				// @todo Here we need to list all the authors from DB
				{ value: 1, label: 'Admin' },
				{ value: 2, label: 'User' },
			],
		},
		{
			id: 'status',
			label: 'Status',
			enableHiding: true,
			filterBy: {
				operators: [ 'isAny' ],
			},
			elements: [
				{ value: 'draft', label: 'Draft' },
				{ value: 'sent', label: 'Sent' },
				{ value: 'active', label: 'Active' },
			],
		},
		{
			id: 'date',
			label: 'Date',
			enableHiding: false,
			render: ( { item } ) => {
				const date = new Date( item.date );
				return <time>{ date.toLocaleString() }</time>;
			},
		},
	];


    const actions = [
		{
			id: 'edit',
			label: 'Edit',
			icon: <Icon icon={ edit } />,
			supportsBulk: false,
			callback: ( items ) => {
				window.location.href = `/wp-admin/post.php?post=${ items[ 0 ].id }&action=edit`;
			},
			isPrimary: true,
		}
	];

    const form = {
		type: 'panel',
		fields: [ 'title' ],
	};

    return (
        <DataViews
            view={ view }
            form={ form }
            actions={ actions }
            onChangeView={ setView }
            
            fields={ fields }
            data={ records ?? [] }
            paginationInfo={ {
                totalItems: totalRecords,
                totalPages: Math.ceil( totalRecords / view.perPage ),
            } }
            defaultLayouts={ {
                table: {
                    showMedia: false,
                },
                grid: {
                    showMedia: true,
                },
                list: {
                    showMedia: true,
                },
            } }
            getItemId={ ( item: Post ) => item.id.toString() }
            onItemClick={ ( item ) => {
                // @todo Investigate why this is not working
                console.log( 'Clicked on item', item ); // eslint-disable-line
            } }
        />
    );
}