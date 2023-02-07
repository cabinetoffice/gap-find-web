import { render, screen } from '@testing-library/react';
import { SearchFilterInput } from '../../../src/components/search-page/search-filter-input/SearchFilterInput';

const filters = {
  display: 'Who can apply',
  index_name: 'fields.grantApplicantType.en-US',
  sublevel: [
    {
      id: '1',
      display: 'Personal / individual',
      search_parameter: 'Personal / Individual',
    },
  ],
  type: 'text-filter',
};

const sublevel = {
  display: 'Personal / individual',
  id: '1',
  search_parameter: 'Personal / Individual',
};

const component = (
  <SearchFilterInput
    filter={filters}
    filterObj={[]}
    index={1}
    sublevel={sublevel}
  />
);

describe('SearchFilterInput component', () => {
  it('should work when there are no filters pre-selected that do not match the filters array', () => {
    render(component);
    const checkbox = screen.getByRole('checkbox', { name: '' });
    expect(checkbox).toBeDefined();
    expect(checkbox.getAttribute('id')).toBe(
      'fields.grantApplicantType.en-US1'
    );
    expect(checkbox.getAttribute('name')).toBe(
      'fields.grantApplicantType.en-US'
    );
    expect(checkbox.getAttribute('data-cy')).toBe(
      'cyPersonal / individualCheckbox'
    );
    expect(checkbox.defaultChecked).toBe(false);
    expect(checkbox.value).toBe('1');
  });

  it('should work when there are filters pre-selected that match the filters array', () => {
    let filterObj = [];
    filterObj['fields.grantApplicantType.en-US'] = {
      display: 'Who can apply',
      index_name: 'fields.grantApplicantType.en-US',
      type: 'text-filter',
      values: [
        {
          display: 'Personal / individual',
          id: '1',
          search_parameter: 'Personal / Individual',
        },
      ],
    };
    render(
      <SearchFilterInput
        filter={filters}
        filterObj={filterObj}
        index={1}
        sublevel={sublevel}
      />
    );
    const checkbox = screen.getByRole('checkbox', { name: '' });
    expect(checkbox).toBeDefined();
    expect(checkbox.getAttribute('id')).toBe(
      'fields.grantApplicantType.en-US1'
    );
    expect(checkbox.getAttribute('name')).toBe(
      'fields.grantApplicantType.en-US'
    );
    expect(checkbox.getAttribute('data-cy')).toBe(
      'cyPersonal / individualCheckbox'
    );
    expect(checkbox.defaultChecked).toBe(true);
    expect(checkbox.value).toBe('1');
  });

  it('should work when there are filters pre-selected but there are no values in the filterObj', () => {
    let filterObj = [];
    filterObj['fields.grantApplicantType.en-US'] = {
      display: 'Who can apply',
      index_name: 'fields.grantApplicantType.en-US',
      type: 'text-filter',
    };
    render(
      <SearchFilterInput
        filter={filters}
        filterObj={filterObj}
        index={1}
        sublevel={sublevel}
      />
    );
    const checkbox = screen.getByRole('checkbox', { name: '' });
    expect(checkbox).toBeDefined();
    expect(checkbox.getAttribute('id')).toBe(
      'fields.grantApplicantType.en-US1'
    );
    expect(checkbox.getAttribute('name')).toBe(
      'fields.grantApplicantType.en-US'
    );
    expect(checkbox.getAttribute('data-cy')).toBe(
      'cyPersonal / individualCheckbox'
    );
    expect(checkbox.defaultChecked).toBe(false);
    expect(checkbox.value).toBe('1');
  });

  it('should work when there are filters pre-selected but there are no index_name in the filters', () => {
    let filterObj = [];
    filterObj['fields.grantApplicantType.en-US'] = {
      display: 'Who can apply',
      type: 'text-filter',
      values: [
        {
          display: 'Personal / individual',
          id: '1',
          search_parameter: 'Personal / Individual',
        },
      ],
    };
    render(
      <SearchFilterInput
        filter={{}}
        filterObj={filterObj}
        index={1}
        sublevel={sublevel}
      />
    );
    const checkbox = screen.getByRole('checkbox', { name: '' });
    expect(checkbox).toBeDefined();
    expect(checkbox.defaultChecked).toBe(false);
    expect(checkbox.value).toBe('1');
  });
});
