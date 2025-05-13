-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: plottwizts
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `comment_text` text NOT NULL,
  `other_user_id` int NOT NULL,
  `episode_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `episode_id_idx` (`episode_id`),
  KEY `user_id_idx` (`user_id`),
  KEY `other_user_id_idx` (`other_user_id`),
  CONSTRAINT `episode_id` FOREIGN KEY (`episode_id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `other_user_id` FOREIGN KEY (`other_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='reviews';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,'ur wrong',2,1),(2,2,'133.121.232.',1,1);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `episodes`
--

DROP TABLE IF EXISTS `episodes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `episodes` (
  `id` int NOT NULL,
  `series_id` int NOT NULL,
  `season_number` int NOT NULL,
  `episode_number` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `air_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `episodes`
--

LOCK TABLES `episodes` WRITE;
/*!40000 ALTER TABLE `episodes` DISABLE KEYS */;
INSERT INTO `episodes` VALUES (1,1,1,1,'Apéritif','2013-04-04'),(2,1,1,2,'Amuse-Bouche','2013-04-11'),(3,1,1,3,'Potage','2013-04-18'),(4,1,1,4,'Œuf','2013-04-24'),(5,1,1,5,'Coquilles','2013-04-25'),(6,1,1,6,'Entrée','2013-05-02'),(7,1,1,7,'Sorbet','2013-05-09'),(8,1,1,8,'Fromage','2013-05-16'),(9,1,1,9,'Trou Normand','2013-05-23'),(10,1,1,10,'Buffet Froid','2013-05-30'),(11,1,1,11,'Rôti','2013-06-06'),(12,1,1,12,'Relevés','2013-06-13'),(13,1,1,13,'Savoureux','2013-06-20'),(14,2,1,1,'The Man Trap','1966-09-08'),(15,2,1,2,'Charlie X','1966-09-15'),(16,2,1,3,'Where No Man Has Gone Before','1966-09-22');
/*!40000 ALTER TABLE `episodes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotes`
--

DROP TABLE IF EXISTS `quotes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotes` (
  `id` int NOT NULL,
  `quote` text NOT NULL,
  `series_title` varchar(255) NOT NULL,
  `season` int NOT NULL,
  `episode` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quotes`
--

LOCK TABLES `quotes` WRITE;
/*!40000 ALTER TABLE `quotes` DISABLE KEYS */;
INSERT INTO `quotes` VALUES (1,'I am the danger.','Breaking Bad',1,6),(2,'Winter is coming.','Game of Thrones',3,22),(3,'How you doin\'?','Friends',4,1),(4,'Bazinga!','The Big Bang Theory',3,5),(5,'D\'oh!','The Simpsons',1,1),(6,'How much cheese is too much cheese?','It\'s Always Sunny in Philadelphia',4,2),(7,'Especially the lies.','Star Trek Deep Space Nine',2,3),(8,'Death to the opposition!','Star Trek Deep Space Nine',1,2),(9,'To think, after all this time, all our lunches together you still don\'t trust me. There\'s hope for you yet, doctor.','Star Trek Deep Space Nine',5,2),(10,'Father, you\'re dying. For once in your life, speak the truth.','Star Trek Deep Space Nine',7,4),(11,'Love and death are the great hinges on which all human sympathies turn.','Hannibal',8,6),(12,'Peter, is your social worker inside that horse?','Hannibal',7,4),(13,'What we do for ourselves, dies with us. What we do for others, lives beyond us','Hannibal',4,1),(14,'You righteous, reckless, twitchy, little man!','Hannibal',6,4),(15,'Don’t be afraid, start the tape','Interview With the Vampire',2,1),(16,'The wilderness that is our daughter.','Interview With the Vampire',1,2),(17,'Memory is a monster. We forget, it doesn’t.','Interview With the Vampire',1,1);
/*!40000 ALTER TABLE `quotes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `episode_id` int NOT NULL,
  `rating` tinyint NOT NULL,
  `review_text` text NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `review_title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id_for_idx` (`user_id`),
  CONSTRAINT `episode_id_for` FOREIGN KEY (`id`) REFERENCES `episodes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_id_for` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_rating_valid` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,1,1,4,'Great! Yupp','2023-02-01 00:00:00','Good'),(2,2,1,1,'Terrible, never watch this!!!','2022-01-01 00:00:00','Awfulll....');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `series`
--

DROP TABLE IF EXISTS `series`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `series` (
  `id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `genre` varchar(100) DEFAULT NULL,
  `release_year` year DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `series`
--

LOCK TABLES `series` WRITE;
/*!40000 ALTER TABLE `series` DISABLE KEYS */;
INSERT INTO `series` VALUES (1,'Hannibal','Both a gift and a curse, Graham has the extraordinary ability to think like his prey—he sees what they see, feels what they feel. But while Graham is pursuing an especially troubling, cannibalistic murderer, Special Agent Jack Crawford teams him with a highly respected psychiatrist – a man with a taste for the criminal minded – Dr. Hannibal Lecter.','Drama, Crime',2013),(2,'Star Trek','Space. The Final Frontier. The U.S.S. Enterprise embarks on a five year mission to explore the galaxy. The Enterprise is under the command of Captain James T. Kirk with First Officer Mr. Spock, from the planet Vulcan. With a determined crew, the Enterprise encounters Klingons, Romulans, time paradoxes, tribbles and genetic supermen led by Khan Noonian Singh. Their mission is to explore strange new worlds, to seek new life and new civilizations, and to boldly go where no man has gone before.','Sci-Fi & Fantasy, Drama',1966),(3,'Vicious','Freddie and Stuart are an old couple who have been together for decades and bicker constantly. Their lives are turned upside down by their new upstairs neighbor Ash, who is sure to cause trouble in their mundane lives.','Comedy',2013),(4,'The Simpsons','Set in Springfield, the average American town, the show focuses on the antics and everyday adventures of the Simpson family; Homer, Marge, Bart, Lisa and Maggie, as well as a virtual cast of thousands. Since the beginning, the series has been a pop culture icon, attracting hundreds of celebrities to guest star. The show has also made name for itself in its fearless satirical take on politics, media and American life in general.','Family, Animation, Comedy',1989),(5,'Breaking Bad','Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family\'s financial future at any cost as he enters the dangerous world of drugs and crime.','Drama, Crime',2008),(6,'Better Call Saul','Six years before Saul Goodman meets Walter White. We meet him when the man who will become Saul Goodman is known as Jimmy McGill, a small-time lawyer searching for his destiny, and, more immediately, hustling to make ends meet. Working alongside, and, often, against Jimmy, is “fixer” Mike Ehrmantraut. The series tracks Jimmy’s transformation into Saul Goodman, the man who puts “criminal” in “criminal lawyer\".','Crime, Drama',2015),(7,'The Sopranos','The story of New Jersey-based Italian-American mobster Tony Soprano and the difficulties he faces as he tries to balance the conflicting requirements of his home life and the criminal organization he heads. Those difficulties are often highlighted through his ongoing professional relationship with psychiatrist Jennifer Melfi. The show features Tony\'s family members and Mafia associates in prominent roles and story arcs, most notably his wife Carmela and his cousin and protégé Christopher Moltisanti.','Drama',1999);
/*!40000 ALTER TABLE `series` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user','guest') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'burgers','burgers@gmail.com','$2b$10$KVCM1Q3jUdG1mzjWpKz4peKp1oTLY7lNw0mxdg/C1ILD2d.cZRUEa','user'),(2,'yahoo','mario@gmail.com','$2b$10$OtYnN4x7MKeiM9xJ.d7uw.YaUwWaz3EdeCOvMffsGju9iKCswZexq','user'),(3,'burr','brr@gmail.com','$2b$10$uoRKHfQBchKlAdBQOzXjbeMBEMqjxTEnjKZzmd4S5wLrZunypveNW','user'),(4,'darkz','darkz@inbox.lv','$2b$10$g9ZhH3wZwgt8lIOrKyqBgO7sjN47Oa5pF/GLDCcvMlq8CUDaX6O2q','user');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-13 21:39:46
