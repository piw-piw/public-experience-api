local NewsLetter = require(game.ReplicatedFirst.Newsletter)
local LatestPage = NewsLetter:GetLatestNewsletter()

if (not LatestPage) then
	return nil
end

local Sections = {}

for i, section in pairs(LatestPage.Sections) do
	local Content = {}
	
	for i, content in pairs (section.Content) do
		if (content.Type == "Image") then
			Content[i] = {
				type = content.Type,
				image_id = content.ImageId
			}
		end
		
		if (content.Type == "Video") then
			Content[i] = {
				type = content.Type,
				video_id = content.VideoId
			}
		end
		
		if (content.Type == "Paragraph") then
			Content[i] = {
				type = content.Type,
				text = content.Text
			}
		end
		
		if (content.Type == "ImageCarousel") then
			Content[i] = {
				type = content.Type,
				image_ids = content.ImageIds
			}
		end
	end

	Sections[i] = {
		header = section.Header,
		content = Content
	}
end

return {
	latest_page = NewsLetter.LatestNewsletter,
	pages = {
		[NewsLetter.LatestNewsletter] = {
			banner_image_id = LatestPage.BannerImageId,
			header_text = LatestPage.Header,
			subheader_text = LatestPage.SubHeader,
			sections = Sections
		}
	}
}
