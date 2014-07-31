-- ----------------------------
-- Table structure for [dbo].[points]
-- ----------------------------
DROP TABLE [dbo].[points]
GO
CREATE TABLE [dbo].[points] (
[pointId] int NOT NULL ,
[status] int DEFAULT ('0') ,
[latitude] decimal(18,10) NULL DEFAULT ('0') ,
[longitude] decimal(18,10) NULL DEFAULT ('0') ,
[heading] varchar(500) NULL ,
[description] varchar(2000) NULL ,
[attribution] varchar(2000) NULL 
)

GO

-- ----------------------------
-- Indexes structure for table points
-- ----------------------------

-- ----------------------------
-- Primary Key structure for table [dbo].[points]
-- ----------------------------
ALTER TABLE [dbo].[points] ADD PRIMARY KEY ([pointId])
GO
