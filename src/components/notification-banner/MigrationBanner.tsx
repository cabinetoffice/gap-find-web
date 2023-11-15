import { MIGRATION_CONTENT_MAP, ImportantBanner } from '.';
import { LOGIN_NOTICE_TYPES } from '../../utils/constants';

const FAILED = 'FAILED';
const SUCCEEDED = 'SUCCEEDED';

const defaultErrorProps = {
  isSuccess: false,
  heading: 'Something went wrong while transferring your data.',
  content: (
    <p className="govuk-body">
      Please get in contact with our support team at{' '}
      <a
        className="govuk-notification-banner__link"
        href="mailto:findagrant@cabinetoffice.gov.uk"
      >
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
  <div className="govuk-grid-column-two-thirds">
    <ImportantBanner
      {...getMigrationBannerProps({
        applyMigrationStatus,
        findMigrationStatus,
        migrationType,
        nameOfGrantUpdated,
      })}
    />
  </div>
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
