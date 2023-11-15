import { axiosConfig } from '../../src/utils';
import { axios } from '../../src/utils/axios';

//TODO remove these ESLint exceptions and fix
export enum SavedSearchStatusType {
  // eslint-disable-next-line no-unused-vars
  DRAFT = 'DRAFT',
  // eslint-disable-next-line no-unused-vars
  CONFIRMED = 'CONFIRMED',
}

export interface Filter {
  name: string;
  subFilterid: number;
}

export interface CreateSavedSearchDto {
  name: string;
  search_term: string;
  filters: Filter[];
  fromDate: Date;
  toDate: Date;
  status: SavedSearchStatusType;
  notifications: boolean;
  email: string;
}

interface User {
  emailAddress: string;
}

export interface SavedSearch {
  id: number;
  name: string;
  search_term: string;
  filters: Filter[];
  fromDate: Date;
  toDate: Date;
  status: SavedSearchStatusType;
  notifications: boolean;
  email: string;
  sub?: string;
  user: User;
}

export async function save(savedSearch: CreateSavedSearchDto) {
  const response = await axios({
    method: 'post',
    url: `${process.env.BACKEND_HOST}/saved-searches`,
    data: savedSearch,
  });
  return response.data;
}

export async function getBySavedSearchId(savedSearchId: number) {
  const response = await axios({
    method: 'get',
    url: `${process.env.BACKEND_HOST}/saved-searches/id/${savedSearchId}`,
  });
  return response.data;
}

export async function getAllSavedSearches(userId: string, jwt: string) {
  const encodedUserId = encodeURIComponent(userId);
  const response = await axios({
    method: 'get',
    url: `${process.env.BACKEND_HOST}/saved-searches/${encodedUserId}`,
    ...axiosConfig(jwt),
  });
  return response.data;
}

export async function updateStatus(
  savedSearchId: number,
  status: SavedSearchStatusType,
) {
  const response = await axios({
    method: 'patch',
    url: `${process.env.BACKEND_HOST}/saved-searches/${savedSearchId}/status`,
    data: {
      status,
    },
  });
  return response.data;
}

export async function deleteSaveSearch(
  savedSearchId: number,
  id: string,
  unsubscribeReferenceId: string,
) {
  const query = unsubscribeReferenceId
    ? `?unsubscribeReference=${unsubscribeReferenceId}`
    : '';
  const response = await axios({
    method: 'post',
    url: `${process.env.BACKEND_HOST}/saved-searches/${savedSearchId}/delete${query}`,
    data: {
      id,
    },
  });
  return response.data;
}
