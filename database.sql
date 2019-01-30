SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `app`
--

CREATE TABLE `starredrepositories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `owner` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `stars` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


INSERT INTO `starredrepositories` (`id`, `name`, `owner`, `link`, `stars`) VALUES
(1, 'Jane', 'Doe', 'https://github.com/', 33);

COMMIT;
