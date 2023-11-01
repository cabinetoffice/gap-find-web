import { MIGRATION_CONTENT_MAP, ImportantBanner } from '.';
import { LOGIN_NOTICE_TYPES } from '../../utils';

const FAILED = 'FAILED';
const SUCCEEDED = 'SUCCEEDED';

const defaultErrorProps = {
  isSuccess: false,
  heading: 'Something went wrong while transferring your data.',
  content: (
    <p>
      Please try again later.{' '}
      <a href="mailto:findagrant@cabinetoffice.gov.uk">
        findagrant@cabinetoffice.gov.uk
      </a>
      .
    </p>
  ),
};

const MigrationBanner = ({
  applyMigrationStatus,
  findMigrationStatus,
  migrationType,
  nameOfGrantUpdated,
}: MigrationProps) => (
  <ImportantBanner
    {...getMigrationBannerProps({
      applyMigrationStatus,
      findMigrationStatus,
      migrationType,
      nameOfGrantUpdated,
    })}
  />
);

const getMigrationBannerProps = ({
  applyMigrationStatus,
  findMigrationStatus,
  migrationType,
  nameOfGrantUpdated,
}: MigrationProps): {
  heading: string;
  content: string | JSX.Element;
  isSuccess: boolean;
} => {
  if (applyMigrationStatus === FAILED || findMigrationStatus === FAILED)
    return defaultErrorProps;

  const isFindOnlyBanner =
    findMigrationStatus === SUCCEEDED && applyMigrationStatus !== SUCCEEDED;

  const getBannerContent = MIGRATION_CONTENT_MAP[migrationType];

  const { HEADING: heading, CONTENT: content } =
    getBannerContent(nameOfGrantUpdated)[
      isFindOnlyBanner ? 'FIND' : 'FIND_AND_APPLY'
    ];

  return { heading, content, isSuccess: true };
};

type MigrationProps = {
  applyMigrationStatus: string;
  findMigrationStatus: string;
  migrationType: keyof typeof LOGIN_NOTICE_TYPES;
  nameOfGrantUpdated?: string;
};

export { MigrationBanner };
