local NewsLetter = require(game.ReplicatedFirst.Newsletter)
local LatestPage = NewsLetter:GetLatestNewsletter()

if (not LatestPage) then
	return nil
end

function FormatLetter(Page)
	local Sections = {}
	
	for i, section in pairs(Page.Sections) do
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
		banner_image_id = Page.BannerImageId,
		header_text = Page.Header,
		subheader_text = Page.SubHeader,
		sections = Sections
	}
end

local Details = {
	latest_page = NewsLetter.LatestNewsletter,
	pages = {
		[NewsLetter.LatestNewsletter] = FormatLetter(LatestPage)
	}
}

local Pages = game.ReplicatedFirst.Newsletter:GetChildren()

for _, Page in pairs(Pages) do
	local PageName = Page.Name
	
	if (PageName == "_Types" or PageName == NewsLetter.LatestNewsletter) then
		continue
	end
	
	local PageInfo = require(Page)
	Details.pages[PageName] = FormatLetter(PageInfo)
end

return Details